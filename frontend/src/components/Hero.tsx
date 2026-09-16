import React from 'react';

interface HeroProps {
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveTab }) => {
  const workflowSteps = [
    { num: '01', title: 'Create Account', desc: 'Quick customer account setup', icon: '👤' },
    { num: '02', title: 'Body Profile', desc: 'Manual entry or AI camera capture', icon: '📷' },
    { num: '03', title: 'Verify & Save', desc: 'Standard cm/in profile versioning', icon: '📏' },
    { num: '04', title: 'Browse & Custom', desc: 'Select tailor, fabric & customization', icon: '👗' },
    { num: '05', title: 'Order & Pay', desc: 'Immutable snapshot & Telebirr/CBE', icon: '💳' },
    { num: '06', title: 'Tailor Sewing', desc: '7-stage live workshop production', icon: '✂️' },
    { num: '07', title: 'Quality & Ship', desc: 'Inspection pass & fleet delivery', icon: '🚚' },
    { num: '08', title: 'Receive & Review', desc: 'Garment delivery & tailor rating', icon: '⭐' },
  ];

  return (
    <section style={{ padding: '60px 0', textAlign: 'center', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600', color: '#f59e0b', marginBottom: '20px' }}>
          <span>🚀</span> SEWFIT: Measure. Customize. Wear.
        </div>

        <h1 style={{ fontSize: '3.4rem', lineHeight: '1.15', marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Precision Custom Clothing Tailored to Your Body.
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#94a3b8', marginBottom: '32px', maxWidth: '760px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
          SEWFIT eliminates the need for customers to physically visit tailoring businesses for measurement and ordering. Store multi-version body profiles, order custom garments, track tailor production, and receive doorstep delivery.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button className="btn-primary" onClick={() => setActiveTab('customer-dashboard')}>
            👤 Go to Customer Dashboard
          </button>
          <button className="btn-secondary" onClick={() => setActiveTab('catalog')}>
            🛍️ Browse Custom Catalog
          </button>
          <button className="btn-secondary" onClick={() => setActiveTab('measurements')}>
            📏 Camera & Manual Body Measurements
          </button>
        </div>

        {/* END-TO-END WORKFLOW STEPPER */}
        <div
          className="glass-card"
          style={{
            padding: '32px 24px',
            marginBottom: '48px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                🔄 Complete SEWFIT Digital Workflow
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                End-to-End digital fitting, tailor production, quality inspection & delivery
              </span>
            </div>
            <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
              ✓ No Store Visits Required
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {workflowSteps.map((st) => (
              <div
                key={st.num}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{st.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    STEP {st.num}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>
                  {st.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📏</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f8fafc' }}>Centimeter Standard</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              All 20+ body metrics are stored in standard cm with automatic inch conversion and non-destructive versioning.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f8fafc' }}>Strict Measurement Privacy</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Tailors only view order-isolated snapshots for orders placed with them. Your private profile remains protected.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✂️</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f8fafc' }}>Verified Tailor Workshops</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Track production stages from Cutting and Sewing to Fitting and quality inspection pass.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛵</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f8fafc' }}>Express Fleet Dispatch</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Seamless dispatch from tailor workshop to your doorstep with live GPS tracking and proof of delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
