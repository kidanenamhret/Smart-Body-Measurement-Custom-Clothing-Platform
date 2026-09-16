"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentService_1 = require("../services/PaymentService");
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const NotificationService_1 = require("../services/NotificationService");
const router = (0, express_1.Router)();
let memoryPayments = [];
/**
 * POST /api/payments/initiate
 * Initiate provider payment (Telebirr, Chapa, Bank, Cash).
 */
router.post('/initiate', async (req, res) => {
    try {
        const { orderId, customerId = 'cust-101', tailorId = '1', amount = 16500, currency = 'ETB', provider = 'TELEBIRR', customerPhone = '+251911234567', } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'Missing required field: orderId' });
        }
        const initiation = await PaymentService_1.defaultPaymentService.initiatePayment({
            orderId: String(orderId),
            customerId: String(customerId),
            amount: Number(amount),
            currency: String(currency),
            provider: provider,
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
            await Payment_1.Payment.create(paymentRecord);
        }
        catch (err) {
            memoryPayments.unshift(paymentRecord);
        }
        return res.status(201).json({
            message: `Payment initiated via ${provider}`,
            initiation,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Payment initiation failed' });
    }
});
/**
 * POST /api/payments/verify
 * CRITICAL SECURITY REQUIREMENT:
 * Verify payment authoritatively via backend provider gateway.
 * Never trust frontend success claims.
 */
router.post('/verify', async (req, res) => {
    try {
        const { provider = 'TELEBIRR', transactionReference, orderId } = req.body;
        if (!transactionReference) {
            return res.status(400).json({ error: 'Missing required field: transactionReference' });
        }
        // Authoritative backend verification against provider adapter
        const verification = await PaymentService_1.defaultPaymentService.verifyPayment(provider, transactionReference);
        if (verification.status === 'SUCCESS') {
            // Update order status & payment info
            if (orderId) {
                try {
                    const order = await Order_1.Order.findOne({ $or: [{ orderId: String(orderId) }, { _id: String(orderId) }] });
                    if (order) {
                        order.status = 'PAID';
                        if (!order.paymentInfo) {
                            order.paymentInfo = { status: 'PAID', paymentMethod: provider, amountPaid: verification.amountVerified };
                        }
                        else {
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
                }
                catch (dbErr) {
                    // ignore memory sync errors
                }
                // Trigger PAYMENT_SUCCESS Notification
                await NotificationService_1.defaultNotificationService.dispatch({
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Payment verification failed' });
    }
});
exports.default = router;
