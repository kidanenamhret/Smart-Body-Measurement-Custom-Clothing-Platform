import React, { useState } from 'react';
import type { Order, OrderStatus, TailorProductionStage, UserRole } from '../types';
import { ProductionProgressBar } from './ProductionProgressBar';

interface OrdersSectionProps {
  orders: Order[];
  activeRole: UserRole;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => Promise<void>;
  onUpdateProductionStage?: (orderId: string, stage: TailorProductionStage, notes?: string) => Promise<void>;
  onOpenPaymentModal?: (order: Order) => void;
  onOpenReviewModal?: (order: Order) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  activeRole,
  onUpdateStatus,
  onUpdateProductionStage,
  onOpenPaymentModal,
  onOpenReviewModal,
}) => {
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
  const [transitionNote, setTransitionNote] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981' };
      case 'IN_PRODUCTION':
      case 'QUALITY_CHECK':
        return { bg: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#f59e0b' };
      case 'OUT_FOR_DELIVERY':
      case 'READY_FOR_PICKUP':
        return { bg: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06b6d4', color: '#06b6d4' };
      case 'ACCEPTED':
      case 'MEASUREMENT_VERIFICATION':
        return { bg: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366f1', color: '#818cf8' };
      case 'CANCELLED':
      case 'REJECTED':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: '1px solid #94a3b8', color: '#cbd5e1' };
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, defaultNote: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const noteToPass = transitionNote || defaultNote;
      await onUpdateStatus(orderId, newStatus, noteToPass);
      setTransitionNote('');
      setActionSuccess(`Order '${orderId}' transitioned to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Status transition failed');
    }
  };

  return (
    <section style={{ padding: '40px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', background: 'linear-gradient(90deg, #f59e0b, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📦 Bespoke Orders & Historical Snapshot Ledger
          </h2>
          <p style={{ color: '#94a3b8' }}>
            Immutable order history preserving snapshots of product details, measurements, pricing line-items, payment state, and verified lifecycle state transitions.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            Active Role: {activeRole}
          </span>
          <span className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' }}>
          ✅ {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' }}>
          ⚠️ {actionError}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '8px' }}>No active orders found</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Configure garments in the catalog or checkout cart items to place a new bespoke order.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => {
            const badge = getStatusBadgeStyle(order.status);
            const product = order.productSnapshot || { name: 'Custom Garment', basePrice: 12500, image: '/sample_custom_tuxedo.jpg' };
            const tailor = order.tailorSnapshot || { businessName: 'Artisan Workshop' };
            const customer = order.customerSnapshot || { name: 'Customer' };
            const pricing = order.pricingSnapshot || { basePrice: product.basePrice, totalCalculatedPrice: product.basePrice, currency: 'ETB', lineItems: [] };

            return (
              <div key={order.orderId} className="glass-card" style={{ padding: '28px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>{order.orderId}</h3>
                      <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', background: badge.bg, border: badge.border, color: badge.color }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      📅 Placed: {new Date(order.createdAt).toLocaleString()} • 👤 Customer: <strong>{customer.name}</strong> • ✂️ Tailor: <strong>{tailor.businessName}</strong>
                    </div>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                    onClick={() => setSelectedHistoryOrder(order)}
                  >
                    📜 View Status History Audit Log ({order.statusHistory?.length || 0})
                  </button>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  {/* Garment Snapshot */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '14px' }}>
                    <img
                      src={product.image || '/sample_custom_tuxedo.jpg'}
                      alt={product.name}
                      style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>{product.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', marginBottom: '6px' }}>
                        Base: {product.basePrice?.toLocaleString()} {pricing.currency || 'ETB'}
                      </div>
                      {order.customization && Object.keys(order.customization).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {Object.entries(order.customization).map(([k, v]) => (
                            <span key={k} style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '4px' }}>
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Measurements Snapshot */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                      📐 Immutable Body Measurements:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {order.measurementSnapshot &&
                        Object.entries(order.measurementSnapshot).map(([mKey, mVal]: [string, any]) => {
                          const displayVal = typeof mVal === 'object' ? `${mVal.value} ${mVal.unit}` : String(mVal);
                          return (
                            <span key={mKey} style={{ fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '4px' }}>
                              {mKey}: <strong>{displayVal}</strong>
                            </span>
                          );
                        })}
                    </div>
                  </div>

                  {/* Pricing Breakdown Snapshot */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                      💰 Locked Server Pricing Snapshot:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      Subtotal: {pricing.basePrice?.toLocaleString()} {pricing.currency || 'ETB'}
                      {pricing.lineItems?.map((li: any, idx: number) => (
                        <div key={idx} style={{ color: '#38bdf8', fontSize: '0.72rem' }}>
                          + {li.groupName}: {li.choiceName} (+{li.priceModifier} {pricing.currency})
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700' }}>Locked Total:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>
                        {pricing.totalCalculatedPrice?.toLocaleString()} {pricing.currency || 'ETB'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Granular Tailor Production Workflow Visual Progress Indicator */}
                <ProductionProgressBar
                  productionStage={order.productionStage || 'ORDER_ACCEPTED'}
                  progressPercent={order.productionProgressPercent || 0}
                  notes={order.productionNotes}
                />

                {/* Tailor Workshop Production Stage Control Panel */}
                {(activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                  <div style={{ marginBottom: '16px', background: 'rgba(245, 158, 11, 0.08)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700', marginBottom: '8px' }}>
                      🛠️ Tailor Workshop Stage Controls (Advance Fabrication):
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { stage: 'ORDER_ACCEPTED' as const, label: '1. Accept Order' },
                        { stage: 'MEASUREMENT_VERIFIED' as const, label: '2. Verify Measurements' },
                        { stage: 'CUTTING' as const, label: '3. Start Cutting' },
                        { stage: 'SEWING' as const, label: '4. Start Sewing' },
                        { stage: 'FINISHING' as const, label: '5. Press & Finish' },
                        { stage: 'QUALITY_CHECK' as const, label: '6. Pass Quality Check' },
                        { stage: 'READY' as const, label: '7. Mark Garment Ready' },
                      ].map((st) => (
                        <button
                          key={st.stage}
                          style={{
                            fontSize: '0.72rem',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: order.productionStage === st.stage ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: order.productionStage === st.stage ? 'rgba(245, 158, 11, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                            color: order.productionStage === st.stage ? '#f59e0b' : '#cbd5e1',
                            cursor: 'pointer',
                            fontWeight: order.productionStage === st.stage ? '700' : '500',
                          }}
                          onClick={async () => {
                            if (onUpdateProductionStage) {
                              try {
                                await onUpdateProductionStage(order.orderId, st.stage, `Tailor advanced workshop stage to ${st.label}`);
                                setActionSuccess(`Production stage updated to '${st.stage}'`);
                                setTimeout(() => setActionSuccess(''), 4000);
                              } catch (err: any) {
                                setActionError(err.message || 'Stage update failed');
                              }
                            }
                          }}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* State Transition Actions Toolbar */}
                <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', marginBottom: '10px' }}>
                    ⚡ Validated State Transitions ({activeRole} Role):
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {order.status === 'PENDING_PAYMENT' && (activeRole === 'CUSTOMER' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                        onClick={() => {
                          if (onOpenPaymentModal) {
                            onOpenPaymentModal(order);
                          } else {
                            handleStatusChange(order.orderId, 'PAID', 'Payment verified via Telebirr gateway');
                          }
                        }}
                      >
                        💳 Pay Order ({pricing.totalCalculatedPrice?.toLocaleString()} {pricing.currency || 'ETB'})
                      </button>
                    )}

                    {order.status === 'PAID' && (activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                        onClick={() => handleStatusChange(order.orderId, 'ACCEPTED', 'Tailor accepted order & assigned cutter')}
                      >
                        ✅ Accept Order into Workshop
                      </button>
                    )}

                    {order.status === 'ACCEPTED' && (activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                        onClick={() => handleStatusChange(order.orderId, 'MEASUREMENT_VERIFICATION', 'Verified measurements against garment pattern blueprint')}
                      >
                        📏 Verify Body Measurements
                      </button>
                    )}

                    {order.status === 'MEASUREMENT_VERIFICATION' && (activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                        onClick={() => handleStatusChange(order.orderId, 'IN_PRODUCTION', 'Fabric cut, tailoring & stitching initiated')}
                      >
                        🧵 Start Production
                      </button>
                    )}

                    {order.status === 'IN_PRODUCTION' && (activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}
                        onClick={() => handleStatusChange(order.orderId, 'QUALITY_CHECK', 'Garment stitching & seam quality inspected')}
                      >
                        🔍 Perform Quality Check
                      </button>
                    )}

                    {order.status === 'QUALITY_CHECK' && (activeRole === 'TAILOR' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        onClick={() => handleStatusChange(order.orderId, 'READY_FOR_PICKUP', 'Quality approved, garment packaged for courier dispatch')}
                      >
                        🎁 Mark Ready For Pickup
                      </button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (activeRole === 'DELIVERY_AGENT' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}
                        onClick={() => handleStatusChange(order.orderId, 'OUT_FOR_DELIVERY', 'Picked up from tailor workshop, en route to customer')}
                      >
                        🛵 Dispatch Out For Delivery
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (activeRole === 'DELIVERY_AGENT' || activeRole === 'ADMIN') && (
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', background: 'linear-gradient(135deg, #10b981, #047857)' }}
                        onClick={() => handleStatusChange(order.orderId, 'DELIVERED', 'Handed to customer with delivery signature')}
                      >
                        🏁 Confirm Delivered
                      </button>
                    )}

                    {/* Cancellation option for early states */}
                    {['PENDING_PAYMENT', 'PAID', 'PENDING_TAILOR'].includes(order.status) && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '8px 14px', borderColor: '#ef4444', color: '#ef4444' }}
                        onClick={() => handleStatusChange(order.orderId, 'CANCELLED', 'Order cancelled before tailoring started')}
                      >
                        🚫 Cancel Order
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                          🎉 Order Completed & Delivered!
                        </span>
                        {activeRole === 'CUSTOMER' && onOpenReviewModal && (
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.78rem', padding: '6px 12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                            onClick={() => onOpenReviewModal(order)}
                          >
                            ⭐ Leave Tailor Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Status History Modal */}
      {selectedHistoryOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '32px', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedHistoryOrder(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '6px' }}>
              📜 Status History Audit Log: {selectedHistoryOrder.orderId}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
              Chronological ledger recording every state transition with actor details, timestamps, and transition notes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedHistoryOrder.statusHistory?.map((h, idx) => (
                <div
                  key={h.historyId || idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f59e0b' }}>
                      {h.previousStatus} ➔ {h.newStatus}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#06b6d4', marginBottom: '4px' }}>
                    👤 Actor: <strong>{h.actor?.name || 'System'}</strong> ({h.actor?.role || 'SYSTEM'})
                  </div>

                  {h.notes && (
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontStyle: 'italic', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px', marginTop: '4px' }}>
                      "{h.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
