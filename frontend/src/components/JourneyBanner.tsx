import React from 'react';

interface JourneyBannerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasMeasurements?: boolean;
}

export const JourneyBanner: React.FC<JourneyBannerProps> = ({
  activeTab,
  setActiveTab,
  hasMeasurements = true,
}) => {
  // Only display the Journey banner on customer flow views
  const customerTabs = ['measurements', 'catalog', 'tailors', 'customer-dashboard', 'hero'];
  if (!customerTabs.includes(activeTab)) return null;

  const steps = [
    {
      id: 'measurements',
      stepNum: 1,
      title: '1. Measure Body',
      subtitle: hasMeasurements ? 'Profile Active ✓' : 'Scan with AI / Manual',
      icon: '📏',
    },
    {
      id: 'catalog',
      stepNum: 2,
      title: '2. Choose Garment',
      subtitle: 'Pick Style & Custom Options',
      icon: '👗',
    },
    {
      id: 'tailors',
      stepNum: 3,
      title: '3. Select Tailor',
      subtitle: 'Match Master Craftsmen',
      icon: '🧵',
    },
    {
      id: 'customer-dashboard',
      stepNum: 4,
      title: '4. Place Order & Track',
      subtitle: 'Live Fitting & Delivery',
      icon: '📦',
    },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(8, 12, 20, 0.4) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 0',
        marginBottom: '24px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {steps.map((s, index) => {
            const isCurrent = activeTab === s.id;
            return (
              <React.Fragment key={s.id}>
                <div
                  onClick={() => setActiveTab(s.id)}
                  style={{
                    flex: '1 1 180px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: isCurrent
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isCurrent
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCurrent ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                      color: isCurrent ? '#000000' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: '800',
                      flexShrink: 0,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        color: isCurrent ? '#f59e0b' : '#f8fafc',
                      }}
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isCurrent ? '#cbd5e1' : '#64748b' }}>
                      {s.subtitle}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      color: '#334155',
                      fontSize: '1rem',
                      fontWeight: '700',
                      display: 'none',
                    }}
                  >
                    ➔
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
