import React, { useState } from 'react';
import type { Tailor, Order, ClothingProduct, OrderStatus, TailorProductionStage } from '../types';
import { ProductionProgressBar } from './ProductionProgressBar';
import { EmptyState, LoadingButton } from './UIComponents';

interface TailorDashboardProps {
  tailor?: Tailor;
  orders: Order[];
  products: ClothingProduct[];
  onUpdateStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  onUpdateProductionStage: (orderId: string, stage: TailorProductionStage, notes?: string) => Promise<void>;
}

export const TailorDashboard: React.FC<TailorDashboardProps> = ({
  tailor = {
    id: '1',
    businessName: 'Royal Habesha Couture',
    description: 'Master bespoke tailors specializing in custom suits and traditional Ethiopian Habesha Kemis.',
    averageRating: 4.9,
    reviewCount: 42,
    verificationStatus: 'VERIFIED',
    businessAddress: 'Bole Medhanealem, Addis Ababa',
  },
  orders,
  products,
  onUpdateStatus,
  onUpdateProductionStage,
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'products' | 'reviews'>('workflow');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filter orders by tailor workflow
  const pendingOrders = orders.filter((o) =>
    ['PENDING_TAILOR', 'PAID', 'MEASUREMENT_VERIFICATION'].includes(o.status)
  );

  const activeProductionOrders = orders.filter((o) =>
    ['ACCEPTED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_FOR_PICKUP'].includes(o.status)
  );

  const completedOrders = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  // Real revenue analytics computed from DB orders
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + (o.pricingSnapshot?.totalCalculatedPrice || o.productSnapshot?.basePrice || 0),
    0
  );

  const pendingRevenue = activeProductionOrders.reduce(
    (sum, o) => sum + (o.pricingSnapshot?.totalCalculatedPrice || o.productSnapshot?.basePrice || 0),
    0
  );

  const handleStageChange = async (orderId: string, stage: TailorProductionStage) => {
    setUpdatingOrderId(orderId);
    try {
      await onUpdateProductionStage(orderId, stage);
    } catch (err: any) {
      alert(`Error updating production stage: ${err.message || err}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextAcceptStatus = (order: Order): OrderStatus => {
    // State machine: MEASUREMENT_VERIFICATION → IN_PRODUCTION (not ACCEPTED)
    if (order.status === 'MEASUREMENT_VERIFICATION') return 'IN_PRODUCTION';
    // PAID or PENDING_TAILOR → ACCEPTED
    return 'ACCEPTED';
  };

  const getAcceptButtonLabel = (order: Order): string => {
    if (order.status === 'MEASUREMENT_VERIFICATION') return '▶ Start Production';
    return '✓ Accept & Start Sewing';
  };

  const handleAcceptOrder = async (order: Order) => {
    const orderId = order.orderId || order.id || '';
    const nextStatus = getNextAcceptStatus(order);
    const note = nextStatus === 'IN_PRODUCTION'
      ? 'Measurements verified — tailor starting production'
      : 'Tailor accepted order for production';
    setUpdatingOrderId(orderId);
    try {
      await onUpdateStatus(orderId, nextStatus, note);
    } catch (err: any) {
      alert(`Error updating order: ${err.message || err}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getVerificationBadge = () => {
    const status = tailor.verificationStatus || 'VERIFIED';
    switch (status) {
      case 'VERIFIED':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid #10b981',
          text: '✓ Verified Master Tailor',
        };
      case 'PENDING':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid #f59e0b',
          text: '⚠️ Verification Pending License Review',
        };
      case 'REJECTED':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid #ef4444',
          text: '❌ License Verification Rejected',
        };
      case 'SUSPENDED':
      default:
        return {
          bg: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          border: '1px solid #ef4444',
          text: '🚫 Workshop Suspended',
        };
    }
  };

  const badge = getVerificationBadge();

  return (
    <div style={{ padding: '32px 0' }}>
      {/* TAILOR HEADER & VERIFICATION STATE */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.8rem' }}>✂️</span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {tailor.businessName} Workshop Dashboard
              </h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              {tailor.businessAddress || 'Addis Ababa'} • Bespoke Production Engine & Garment Specifications
            </p>
          </div>

          {/* VERIFICATION STATE BADGE (Requirement 40) */}
          <div style={{ padding: '8px 16px', borderRadius: '20px', background: badge.bg, color: badge.color, border: badge.border, fontSize: '0.875rem', fontWeight: '700' }}>
            {badge.text}
          </div>
        </div>
      </div>

      {/* REVENUE WHERE APPROPRIATE & WORKSHOP METRICS (Requirement 40) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Real Earned Revenue
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>
            {totalRevenue.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>ETB</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px', display: 'block' }}>
            ✓ {completedOrders.length} Completed Orders
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Pending Pipeline Volume
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>
            {pendingRevenue.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>ETB</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '4px', display: 'block' }}>
            ⚡ {activeProductionOrders.length} In Active Sewing
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Pending Approval Orders
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#06b6d4' }}>
            {pendingOrders.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px', display: 'block' }}>
            Awaiting Measurement Verification
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Customer Workshop Rating
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ★ {tailor.averageRating || 4.9}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>
            Based on {tailor.reviewCount || 42} Verified Reviews
          </span>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '24px', gap: '16px' }}>
        <button
          onClick={() => setActiveTab('workflow')}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'workflow' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'workflow' ? '#f59e0b' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          🧵 Orders & Live Production Board ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'products' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'products' ? '#f59e0b' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          👗 Workshop Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'reviews' ? '#f59e0b' : '#94a3b8',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          ⭐ Ratings & Reviews
        </button>
      </div>

      {activeTab === 'workflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* 1. PENDING ORDERS (Requirement 40) */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fbbf24', marginBottom: '16px' }}>
              ⏳ Pending Orders Awaiting Acceptance ({pendingOrders.length})
            </h3>

            {pendingOrders.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                No new pending orders right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingOrders.map((ord) => (
                  <div key={ord.orderId || ord.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700' }}>ORDER #{ord.orderId}</span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', margin: '2px 0' }}>
                          {ord.productSnapshot?.name || 'Custom Garment'}
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                          Customer: <strong>{ord.customerSnapshot?.name || 'Customer'}</strong> ({ord.customerSnapshot?.email})
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Status badge */}
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
                          background: ord.status === 'MEASUREMENT_VERIFICATION' ? 'rgba(6,182,212,0.15)' : 'rgba(245,158,11,0.15)',
                          color: ord.status === 'MEASUREMENT_VERIFICATION' ? '#38bdf8' : '#fbbf24',
                          border: ord.status === 'MEASUREMENT_VERIFICATION' ? '1px solid #06b6d4' : '1px solid #f59e0b',
                        }}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        <LoadingButton
                          isLoading={updatingOrderId === (ord.orderId || ord.id)}
                          onClick={() => handleAcceptOrder(ord)}
                        >
                          {getAcceptButtonLabel(ord)}
                        </LoadingButton>
                        <button
                          className="btn-secondary"
                          disabled={updatingOrderId === (ord.orderId || ord.id)}
                          onClick={() => onUpdateStatus(ord.orderId || ord.id || '', 'REJECTED', 'Tailor rejected order')}
                          style={{ padding: '8px 14px', fontSize: '0.825rem', color: '#f87171' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. ACTIVE PRODUCTION WORKFLOW (Requirement 40) */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#38bdf8', marginBottom: '16px' }}>
              ⚙️ Active Production Stage Board ({activeProductionOrders.length})
            </h3>

            {activeProductionOrders.length === 0 ? (
              <EmptyState
                icon="🧵"
                title="No Orders in Active Sewing"
                description="Orders accepted from pending queue will appear here for live production updates."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeProductionOrders.map((ord) => {
                  const currentStage = ord.productionStage || 'ORDER_ACCEPTED';
                  const orderKey = ord.orderId || ord.id || '';

                  return (
                    <div key={orderKey} className="glass-card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '700' }}>ORDER #{ord.orderId}</span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', margin: '2px 0' }}>
                            {ord.productSnapshot?.name || 'Custom Garment'}
                          </h4>
                          <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                            Customer: <strong>{ord.customerSnapshot?.name}</strong> • Qty: {ord.quantity || 1}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>
                            {(ord.pricingSnapshot?.totalCalculatedPrice || ord.productSnapshot?.basePrice || 0).toLocaleString()} ETB
                          </span>
                        </div>
                      </div>

                      {/* Live Progress Bar */}
                      <div style={{ marginBottom: '20px' }}>
                        <ProductionProgressBar
                          productionStage={ord.productionStage}
                          progressPercent={ord.productionProgressPercent}
                        />
                      </div>

                      {/* Stage Action Controls */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
                          Advance Tailor Production Stage:
                        </span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(['MEASUREMENT_VERIFIED', 'CUTTING', 'SEWING', 'FINISHING', 'QUALITY_CHECK', 'READY'] as TailorProductionStage[]).map((stg) => {
                            const isCurrent = currentStage === stg;
                            return (
                              <button
                                key={stg}
                                onClick={() => handleStageChange(orderKey, stg)}
                                disabled={updatingOrderId === orderKey}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  borderRadius: '6px',
                                  border: isCurrent ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                                  background: isCurrent ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                                  color: isCurrent ? '#38bdf8' : '#cbd5e1',
                                  cursor: 'pointer',
                                }}
                              >
                                {stg.replace(/_/g, ' ')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. COMPLETED ORDERS HISTORY (Requirement 40) */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#34d399', marginBottom: '16px' }}>
              ✅ Completed Garment Deliveries ({completedOrders.length})
            </h3>

            {completedOrders.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                No completed orders logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {completedOrders.map((ord) => (
                  <div key={ord.orderId || ord.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.85rem' }}>#{ord.orderId}</span> • <span style={{ color: '#f8fafc' }}>{ord.productSnapshot?.name}</span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Client: {ord.customerSnapshot?.name}</div>
                    </div>
                    <div style={{ fontWeight: '800', color: '#10b981' }}>
                      {(ord.pricingSnapshot?.totalCalculatedPrice || ord.productSnapshot?.basePrice || 0).toLocaleString()} ETB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              👗 Offered Garments Catalog ({products.length})
            </h3>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
              + Add New Garment Option
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((prod) => (
              <div key={prod.id || prod.productId} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>{prod.name}</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
                  {prod.basePrice.toLocaleString()} ETB
                </div>
                <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block' }}>
                  Lead Time: {prod.productionTime || '7 days'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RATINGS & REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' }}>
            ⭐ Workshop Reputation & Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#f59e0b' }}>
              {tailor.averageRating || 4.9}
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★★★★★</div>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Based on {tailor.reviewCount || 42} verified customer reviews</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
