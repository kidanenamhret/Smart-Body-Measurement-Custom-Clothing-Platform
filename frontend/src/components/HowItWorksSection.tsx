import React from 'react';

interface HowItWorksSectionProps {
  onNavigateTab: (tab: string) => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onNavigateTab }) => {
  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '16px' }}>
          How SEWFIT Works
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          Your journey to perfect bespoke clothing, simplified into five easy steps.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Step 01 */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(245, 158, 11, 0.2)', minWidth: '60px', textAlign: 'center' }}>
            01
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>Measure yourself</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>Use our guided measurement system.</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', color: 'rgba(245, 158, 11, 0.5)', fontSize: '1.5rem', margin: '5px 0' }}>↓</div>

        {/* Step 02 */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(245, 158, 11, 0.2)', minWidth: '60px', textAlign: 'center' }}>
            02
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>Choose your garment</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>Select from professional tailors.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(245, 158, 11, 0.5)', fontSize: '1.5rem', margin: '5px 0' }}>↓</div>

        {/* Step 03 */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(245, 158, 11, 0.2)', minWidth: '60px', textAlign: 'center' }}>
            03
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>Customize</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>Choose fabric, color, fit and details.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(245, 158, 11, 0.5)', fontSize: '1.5rem', margin: '5px 0' }}>↓</div>

        {/* Step 04 */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(245, 158, 11, 0.2)', minWidth: '60px', textAlign: 'center' }}>
            04
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>Your tailor makes it</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>The tailor receives your verified measurements.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'rgba(245, 158, 11, 0.5)', fontSize: '1.5rem', margin: '5px 0' }}>↓</div>

        {/* Step 05 */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(245, 158, 11, 0.2)', minWidth: '60px', textAlign: 'center' }}>
            05
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>Delivered to you</h3>
            <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>Track your order from production to delivery.</p>
          </div>
        </div>

      </div>
      
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <button 
          className="btn-primary" 
          onClick={() => onNavigateTab('measurements')}
          style={{ padding: '16px 32px', fontSize: '1.1rem' }}
        >
          Start Your Measurement Profile
        </button>
      </div>
    </div>
  );
};
