import React, { useState } from 'react';
import type { Order, PaymentProvider, PaymentRecord } from '../types';
import { initiatePayment, verifyPayment } from '../services/api';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('Telebirr');
  const [step, setStep] = useState<'SELECT' | 'INSTRUCTIONS' | 'SUCCESS'>('SELECT');
  const [isInitiating, setIsInitiating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activePayment, setActivePayment] = useState<PaymentRecord | null>(null);
  const [instructions, setInstructions] = useState<any>(null);
  const [transactionRefInput, setTransactionRefInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !order) return null;

  const handleInitiate = async () => {
    setIsInitiating(true);
    setErrorMessage('');
    try {
      const res = await initiatePayment({
        orderId: order.orderId,
        provider: selectedProvider,
        customerId: order.customerId,
        amount: order.pricingSnapshot.totalCalculatedPrice,
        currency: order.pricingSnapshot.currency,
      });

      setActivePayment(res.payment);
      setInstructions(res.paymentInstructions);
      setStep('INSTRUCTIONS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate payment gateway session');
    } finally {
      setIsInitiating(false);
    }
  };

  const handleVerify = async () => {
    if (!activePayment) return;
    setIsVerifying(true);
    setErrorMessage('');
    try {
      const res = await verifyPayment({
        paymentId: activePayment.paymentId,
        transactionReference: transactionRefInput || `TXN-${Date.now().toString(36).toUpperCase()}`,
      });

      if (res?.payment?.status === 'SUCCESS' || res?.verification?.status === 'SUCCESS' || res?.orderUpdated) {
        setStep('SUCCESS');
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
      } else {
        setErrorMessage('Payment verification pending or unconfirmed by provider.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetState = () => {
    setStep('SELECT');
    setActivePayment(null);
    setInstructions(null);
    setTransactionRefInput('');
    setErrorMessage('');
    onClose();
  };

  const providers = [
    { id: 'Telebirr', name: 'Telebirr', desc: 'Ethio Telecom Mobile Money', icon: '📱', color: '#0ea5e9' },
    { id: 'Chapa', name: 'Chapa', desc: 'Debit / Credit / CBE Birr', icon: '⚡', color: '#10b981' },
    { id: 'Bank', name: 'Bank Transfer', desc: 'CBE / Dashen / Awash Direct', icon: '🏦', color: '#f59e0b' },
    { id: 'Cash', name: 'Cash on Pickup', desc: 'Pay at Tailor Studio', icon: '💵', color: '#8b5cf6' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', padding: '16px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
        
        {/* Header */}
        <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0' }}>
              💳 Complete Payment
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Order #{order.orderId} • Total: <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{order.pricingSnapshot.totalCalculatedPrice.toLocaleString()} {order.pricingSnapshot.currency || 'ETB'}</span>
            </p>
          </div>
          <button onClick={resetState} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(153, 27, 27, 0.4)', border: '1px solid #991b1b', color: '#fca5a5', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {step === 'SELECT' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '12px' }}>
                Select Payment Provider:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {providers.map((p) => {
                  const isSelected = selectedProvider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProvider(p.id as PaymentProvider)}
                      style={{
                        padding: '16px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
                        background: isSelected ? `rgba(255,255,255,0.05)` : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid #334155',
                        display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: isSelected ? `2px solid ${p.color}` : '2px solid #64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={resetState} className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.9rem' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleInitiate} disabled={isInitiating} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  {isInitiating ? 'Initiating...' : `Proceed with ${selectedProvider}`}
                </button>
              </div>
            </div>
          )}

          {step === 'INSTRUCTIONS' && instructions && (
            <div>
              <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
                  Payment Gateway Reference
                </div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>
                  {instructions.reference || activePayment?.paymentId}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid #334155', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Instructions:</div>
                <p style={{ margin: '0 0 8px 0' }}>{instructions.instructions}</p>
                <p style={{ margin: 0, color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                  * All payment claims are authoritatively verified by backend webhook integration before order state is transitioned to PAID.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Provider Transaction Reference (Optional for Instant Sandbox):
                </label>
                <input
                  type="text"
                  value={transactionRefInput}
                  onChange={(e) => setTransactionRefInput(e.target.value)}
                  placeholder="e.g. TXN-TB-998822"
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', color: '#fff' }}
                />
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={() => setStep('SELECT')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  ← Change Method
                </button>
                <button type="button" onClick={handleVerify} disabled={isVerifying} style={{ background: '#10b981', color: '#fff', fontWeight: 'bold', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: isVerifying ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                  {isVerifying ? '⏳ Verifying...' : 'Verify & Confirm Payment ✓'}
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto', border: '2px solid rgba(16, 185, 129, 0.4)' }}>
                ✓
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Payment Verified!</h4>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', maxWidth: '300px', margin: '0 auto' }}>
                Order status updated to <span style={{ color: '#10b981', fontWeight: 'bold' }}>PAID</span>. Your tailor will begin processing your bespoke garment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
