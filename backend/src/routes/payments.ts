import { Router, Request, Response } from 'express';
import { defaultPaymentService, PaymentProvider } from '../services/PaymentService';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { defaultNotificationService } from '../services/NotificationService';

const router = Router();
let memoryPayments: any[] = [];

/**
 * POST /api/payments/initiate
 * Initiate provider payment (Telebirr, Chapa, Bank, Cash).
 */
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      customerId = 'cust-101',
      tailorId = '1',
      amount = 16500,
      currency = 'ETB',
      provider = 'TELEBIRR',
      customerPhone = '+251911234567',
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing required field: orderId' });
    }

    const initiation = await defaultPaymentService.initiatePayment({
      orderId: String(orderId),
      customerId: String(customerId),
      amount: Number(amount),
      currency: String(currency),
      provider: provider as PaymentProvider,
      customerPhone,
    });

    const paymentRecord = {
      orderId: String(orderId),
      customerId: String(customerId),
      tailorId: String(tailorId),
      amount: Number(amount),
      currency: String(currency),
      paymentMethod: provider,
      transactionReference: initiation.transactionReference,
      status: initiation.status,
      createdAt: new Date(),
    };

    try {
      await Payment.create(paymentRecord);
    } catch (err) {
      memoryPayments.unshift(paymentRecord);
    }

    return res.status(201).json({
      message: `Payment initiated via ${provider}`,
      initiation,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment initiation failed' });
  }
});

/**
 * POST /api/payments/verify
 * CRITICAL SECURITY REQUIREMENT:
 * Verify payment authoritatively via backend provider gateway.
 * Never trust frontend success claims.
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { provider = 'TELEBIRR', transactionReference, orderId } = req.body;

    if (!transactionReference) {
      return res.status(400).json({ error: 'Missing required field: transactionReference' });
    }

    // Authoritative backend verification against provider adapter
    const verification = await defaultPaymentService.verifyPayment(
      provider as PaymentProvider,
      transactionReference
    );

    if (verification.status === 'SUCCESS') {
      // Update order status & payment info
      if (orderId) {
        try {
          const order = await Order.findOne({ $or: [{ orderId: String(orderId) }, { _id: String(orderId) }] });
          if (order) {
            order.status = 'PAID';
            if (!order.paymentInfo) {
              order.paymentInfo = { status: 'PAID', paymentMethod: provider, amountPaid: verification.amountVerified };
            } else {
              order.paymentInfo.status = 'PAID';
              order.paymentInfo.amountPaid = verification.amountVerified;
            }
            order.statusHistory.push({
              historyId: `hist-pay-${Date.now()}`,
              orderId: order.orderId,
              previousStatus: 'PENDING_PAYMENT',
              newStatus: 'PAID',
              actor: { userId: 'backend-gateway', role: 'SYSTEM', name: `${provider} Payment Gateway` },
              timestamp: new Date(),
              notes: `Payment verified authoritatively: ${verification.message}`,
            });
            await order.save();
          }
        } catch (dbErr) {
          // ignore memory sync errors
        }

        // Trigger PAYMENT_SUCCESS Notification
        await defaultNotificationService.dispatch({
          recipientId: 'cust-101',
          recipientRole: 'CUSTOMER',
          eventType: 'PAYMENT_SUCCESS',
          title: '💳 Payment Verified',
          message: `Your payment of ${verification.amountVerified} ETB for Order #${orderId} was authoritatively verified!`,
          channels: ['in-app', 'SMS'],
        });
      }
    }

    return res.json({
      message: 'Backend payment verification complete',
      verification,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

export default router;
