import React, { useState } from 'react';
import type { MeasurementProfile, Order, ClothingProduct, NotificationItem } from '../types';
import { ProductionProgressBar } from './ProductionProgressBar';
import { EmptyState } from './UIComponents';

interface CustomerDashboardProps {
  customerName?: string;
  profiles: MeasurementProfile[];
  orders: Order[];
  products: ClothingProduct[];
  notifications?: NotificationItem[];
  onNavigateTab: (tab: string) => void;
  onOpenPaymentModal?: (order: Order) => void;
  onAddToCart?: (payload: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customerName = 'Mesfin Bekele',
  profiles,
  orders,
  products,
  onNavigateTab,
  onOpenPaymentModal,
}) => {
  const [recommendedCategory, setRecommendedCategory] = useState<string>('ALL');

  const currentProfile = profiles.find((p) => p.isCurrent) || profiles[0];

  // Dynamic greeting based on current time
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Active orders in production
  const activeOrders = orders.filter((o) =>
    ['PENDING_PAYMENT', 'PAID', 'PENDING_TAILOR', 'ACCEPTED', 'MEASUREMENT_VERIFICATION', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  // Measurements checklist status calculation
  const defaultChecklist = [
    { name: 'Height', key: 'height', required: true },
    { name: 'Chest', key: 'chest', required: true },
    { name: 'Waist', key: 'waist', required: true },
    { name: 'Shoulder', key: 'shoulder', required: true },
    { name: 'Sleeve Length', key: 'sleeveLength', required: true },
    { name: 'Neck', key: 'neck', required: false },
    { name: 'Inseam', key: 'inseam', required: false },
  ];

  const profileMeasurements = currentProfile?.measurements || {};
  const completedCount = defaultChecklist.filter((item) => profileMeasurements[item.key] && profileMeasurements[item.key].value > 0).length;
  const completionPercentage = Math.round((completedCount / defaultChecklist.length) * 100);

  // Recommended products filtering
  const recommendedProducts = products.filter((p) => {
    if (recommendedCategory === 'ALL') return true;
    const catName = p.name.toLowerCase();
    return catName.includes(recommendedCategory.toLowerCase());
  }).slice(0, 3);

  return (
    <div style={{ padding: '24px 0' }}>
      {/* 1. INTELLIGENT GREETING HEADER */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.6rem' }}>👋</span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {timeGreeting}, {customerName.split(' ')[0]}
              </h1>
            </div>
            <p style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
              Your perfect fit starts with your measurements.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onNavigateTab('measurements')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
            >
              <span>📐</span> Measure Yourself (Steps 1–7)
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigateTab('catalog')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px' }}
            >
              <span>👗</span> Browse Garments
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY MEASUREMENT PROFILE CARD (INTELLIGENT CHECKLIST) */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.2rem' }}>👤</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                BODY MEASUREMENT PROFILE
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
              Profile: <strong style={{ color: '#f59e0b' }}>{currentProfile?.profileName || 'Primary Bespoke Profile'}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b' }}>
              Your profile is {completionPercentage}% complete
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {completedCount} of {defaultChecklist.length} metrics recorded
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
          <div
            style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
              borderRadius: '6px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Measurement Metric Checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {defaultChecklist.map((item) => {
            const recorded = profileMeasurements[item.key] && profileMeasurements[item.key].value > 0;
            const verified = profileMeasurements[item.key]?.verified;

            return (
              <div
                key={item.key}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: recorded
                    ? verified
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${
                    recorded
                      ? verified
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f8fafc', display: 'block' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: recorded ? '#10b981' : '#94a3b8' }}>
                    {recorded ? `${profileMeasurements[item.key].value} ${profileMeasurements[item.key].unit}` : 'Missing'}
                  </span>
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>
                  {recorded ? (verified ? '✓' : '⚠️ Need verification') : '✕'}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => onNavigateTab('measurements')}
            style={{ padding: '10px 20px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📐</span> Measure Yourself (Step 1–7)
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigateTab('measurements')}
            style={{ padding: '10px 20px', fontSize: '0.875rem' }}
          >
            📱 AI-Assisted Camera Scan
          </button>
        </div>
      </div>

      {/* 3. RECOMMENDED FOR YOUR MEASUREMENTS */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Recommended for your measurements
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Tailored styles calibrated specifically for your height and shoulder width.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'Suit', 'Shirt', 'Trouser'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRecommendedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: recommendedCategory === cat ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: recommendedCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: recommendedCategory === cat ? '#f59e0b' : '#cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: recommendedCategory === cat ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                [{cat === 'ALL' ? 'All' : cat}]
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {recommendedProducts.map((p) => (
            <div
              key={p.id}
              className="glass-card"
              style={{
                padding: '16px',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ height: '160px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', marginBottom: '4px' }}>{p.name}</h4>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                Starting from <strong style={{ color: '#f59e0b' }}>{p.basePrice.toLocaleString()} ETB</strong>
              </div>
              <button
                className="btn-primary"
                onClick={() => onNavigateTab('catalog')}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.825rem', justifyContent: 'center' }}
              >
                Customize & Order ➔
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. YOUR CURRENT ORDERS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
            Your current orders
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
          >
            View All Orders ({orders.length}) →
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No Active Orders Currently"
            description="Explore our bespoke garments to place your first tailored order."
            actionText="Browse Garment Catalog"
            onAction={() => onNavigateTab('catalog')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeOrders.map((order) => (
              <div key={order.orderId || order.id} className="glass-card" style={{ padding: '20px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '800', letterSpacing: '0.05em' }}>
                      ORDER #{order.orderId}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', margin: '2px 0 4px 0' }}>
                      {order.productSnapshot?.name || 'Custom Tailored Garment'}
                    </h4>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      Tailor: <strong style={{ color: '#cbd5e1' }}>{order.tailorSnapshot?.businessName || (order as any).tailorName || 'Bespoke Atelier'}</strong>
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid #10b981',
                        display: 'inline-block',
                      }}
                    >
                      Status: {order.status.replace(/_/g, ' ')}
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', marginTop: '6px' }}>
                      {(order.pricingSnapshot?.totalCalculatedPrice || order.productSnapshot?.basePrice || 0).toLocaleString()} ETB
                    </div>
                  </div>
                </div>

                <div style={{ margin: '14px 0' }}>
                  <ProductionProgressBar productionStage={order.productionStage} progressPercent={order.productionProgressPercent || (order as any).productionProgress} />
                </div>

                {order.status === 'PENDING_PAYMENT' && onOpenPaymentModal && (
                  <button
                    className="btn-primary"
                    onClick={() => onOpenPaymentModal(order)}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                  >
                    💳 Complete Escrow Payment Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
