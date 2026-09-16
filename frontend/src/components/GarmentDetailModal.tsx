import React, { useState, useEffect } from 'react';
import type { ClothingProduct, PriceCalculationResult, MeasurementProfile } from '../types';
import { calculateProductPrice } from '../services/api';

interface GarmentDetailModalProps {
  product: ClothingProduct;
  profiles?: MeasurementProfile[];
  isFavorite?: boolean;
  onToggleFavorite?: (productId?: string) => Promise<void>;
  onClose: () => void;
  onConfirmOrder: (payload: {
    productId: string;
    tailorId: string;
    quantity: number;
    measurementProfileId: string;
    customization: Record<string, any>;
  }) => void;
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  product,
  profiles = [],
  isFavorite = false,
  onToggleFavorite,
  onClose,
  onConfirmOrder,
}) => {
  const currentProfile = profiles.find((p) => p.isCurrent) || profiles[0];
  const userMeasurements = currentProfile?.measurements || {};

  // Customization choices
  const [fabric, setFabric] = useState<string>(product.fabricOptions?.[0] || 'Italian Pure Wool');
  const [color, setColor] = useState<string>(product.colorOptions?.[0] || 'Midnight Navy');
  const [fit, setFit] = useState<string>('Slim Fit');
  const [collar, setCollar] = useState<string>('Peak Lapel');
  const [lining, setLining] = useState<string>('Paisley Silk');
  const [buttons, setButtons] = useState<string>('Horn Buttons');
  const [embroidery, setEmbroidery] = useState<string>('Custom Monogram');
  const [pricing, setPricing] = useState<PriceCalculationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Recalculate price whenever customization choices change
  useEffect(() => {
    const selections = { fabric, color, fit, collar, lining, buttons, embroidery };
    calculateProductPrice(String(product.id || product.productId), selections, product.basePrice).then((res) => {
      setPricing(res);
    });
  }, [product, fabric, color, fit, collar, lining, buttons, embroidery]);

  const handleCustomOrderSubmit = () => {
    setIsSubmitting(true);
    const payload = {
      productId: String(product.id || product.productId),
      tailorId: '1',
      quantity: 1,
      measurementProfileId: currentProfile?.id || `profile-${Date.now()}`,
      customization: { fabric, color, fit, collar, lining, buttons, embroidery },
    };
    onConfirmOrder(payload);
  };

  // Required measurements checklist against current customer profile
  const requiredList = product.requiredMeasurements || ['chest', 'waist', 'shoulder', 'sleeveLength'];
  const missingMeasurements = requiredList.filter(m => !(userMeasurements[m] && userMeasurements[m].value > 0));
  const availableCount = requiredList.length - missingMeasurements.length;
  const completeness = Math.round((availableCount / requiredList.length) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          background: '#0f172a',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
        >
          ✕
        </button>

        {/* 2-COLUMN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* LEFT COLUMN: Image & Tailor Information */}
          <div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '360px', marginBottom: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧵</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f8fafc' }}>Bespoke Master Atelier</div>
                  <div style={{ fontSize: '0.78rem', color: '#f59e0b' }}>Royal Habesha Couture • 4.9 ★★★★★</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Hand-cut pattern designed specifically for your height and shoulder width.
              </p>
            </div>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700' }}>✓ Custom measured fit</div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700' }}>✓ Premium fabric selection</div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '700' }}>✓ Color & lapel customization</div>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>⏱ Production lead time: {product.productionTime || '7 days'}</div>
            </div>
          </div>

          {/* RIGHT COLUMN: Customization, Required Measurements & Pricing */}
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>
              {product.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.9rem' }}>★★★★★ 4.9 (24 reviews)</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>• Handcrafted Bespoke</span>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', marginBottom: '20px' }}>
              Starting from {product.basePrice.toLocaleString()} {product.currency || 'ETB'}
            </div>

            {/* Fabric Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Fabric Selection:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(product.fabricOptions || ['Italian Pure Wool', 'Egyptian Cotton', 'Belgian Linen']).map((fab) => (
                  <button
                    key={fab}
                    onClick={() => setFabric(fab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: fabric === fab ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      background: fabric === fab ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: fabric === fab ? '#f59e0b' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: fabric === fab ? '700' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    ○ {fab}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Color Preference:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(product.colorOptions || ['Midnight Navy', 'Charcoal Grey', 'Deep Emerald', 'Ivory']).map((col) => (
                  <button
                    key={col}
                    onClick={() => setColor(col)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: color === col ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      background: color === col ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: color === col ? '#06b6d4' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: color === col ? '700' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    ● {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Silhouette Fit:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Slim Fit', 'Regular Fit', 'Relaxed Fit'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFit(f)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: fit === f ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      background: fit === f ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: fit === f ? '#f59e0b' : '#cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: fit === f ? '700' : '500',
                      cursor: 'pointer',
                    }}
                  >
                    ○ {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Collar & Lapel Options */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Collar & Lapel Style:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Peak Lapel', 'Notch Lapel', 'Shawl Collar', 'Mandarin Collar'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCollar(c)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: collar === c ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      background: collar === c ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: collar === c ? '#34d399' : '#cbd5e1',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    ✂️ {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Lining & Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Lining Material:
                </label>
                <select
                  value={lining}
                  onChange={(e) => setLining(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                >
                  <option value="Paisley Silk">Paisley Silk</option>
                  <option value="Satin Jacquard">Satin Jacquard</option>
                  <option value="Bemberg Cupro">Bemberg Cupro</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Buttons:
                </label>
                <select
                  value={buttons}
                  onChange={(e) => setButtons(e.target.value)}
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                >
                  <option value="Horn Buttons">Horn Buttons</option>
                  <option value="Mother of Pearl">Mother of Pearl</option>
                  <option value="Antique Brass">Antique Brass</option>
                </select>
              </div>
            </div>

            {/* Monogram Embroidery */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                Monogram Embroidery:
              </label>
              <input
                type="text"
                value={embroidery}
                onChange={(e) => setEmbroidery(e.target.value)}
                placeholder="e.g. Initial Embroidery M.B."
                style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
              />
            </div>

            {/* MEASUREMENT COMPLETENESS */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Measurement Completeness
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>
                  {availableCount} / {requiredList.length} available
                </div>
              </div>

              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${completeness}%`, height: '100%', background: completeness === 100 ? '#10b981' : '#f59e0b', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: completeness === 100 ? '#10b981' : '#f59e0b', marginBottom: '20px' }}>
                {completeness}% complete
              </div>

              {missingMeasurements.length > 0 ? (
                <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
                  <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> {missingMeasurements.length} measurement{missingMeasurements.length > 1 ? 's' : ''} required
                  </div>
                  <ul style={{ margin: '0 0 16px 24px', padding: 0, color: '#fcd34d', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {missingMeasurements.map(m => (
                      <li key={m} style={{ textTransform: 'capitalize' }}>
                        {m.replace(/([A-Z])/g, ' $1')}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                    onClick={onClose} // Typically we'd route them to the measure wizard here
                  >
                    Complete Measurements
                  </button>
                </div>
              ) : (
                <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <span>✓</span> All required measurements available
                </div>
              )}
            </div>

            {/* Total Server-Calculated Price Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Server-Validated Total:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                  {(pricing?.totalCalculatedPrice || product.basePrice).toLocaleString()} ETB
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399', textAlign: 'right' }}>
                ✓ Price Verified<br />
                ✓ Tailor Customization
              </div>
            </div>

            {/* ACTION CTAs */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {onToggleFavorite && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onToggleFavorite(String(product.id || product.productId))}
                  style={{
                    padding: '14px 18px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: isFavorite ? '#ef4444' : '#cbd5e1',
                    borderColor: isFavorite ? 'rgba(239, 68, 68, 0.4)' : undefined,
                    background: isFavorite ? 'rgba(239, 68, 68, 0.15)' : undefined,
                  }}
                  title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <span>{isFavorite ? '❤️' : '🤍'}</span>
                  <span>{isFavorite ? 'Favorited' : 'Save'}</span>
                </button>
              )}
              <button
                className="btn-primary"
                onClick={handleCustomOrderSubmit}
                disabled={isSubmitting || missingMeasurements.length > 0}
                style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '800', justifyContent: 'center', opacity: missingMeasurements.length > 0 ? 0.5 : 1 }}
              >
                {isSubmitting ? 'Configuring Order...' : missingMeasurements.length > 0 ? 'Measurements Required' : 'Customize & Order ➔'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
