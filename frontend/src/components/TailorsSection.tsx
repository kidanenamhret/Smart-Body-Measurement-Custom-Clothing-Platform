import React from 'react';
import type { Tailor, FavoriteItem } from '../types';

interface TailorsSectionProps {
  tailors: Tailor[];
  favorites?: FavoriteItem[];
  onToggleFavorite?: (productId?: string, tailorId?: string) => Promise<void>;
}

export const TailorsSection: React.FC<TailorsSectionProps> = ({
  tailors,
  favorites = [],
  onToggleFavorite,
}) => {
  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Verified Bespoke Tailor Workshops</h2>
        <p style={{ color: '#94a3b8' }}>
          Connect with verified artisan workshops and master tailors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {tailors.map((tailor) => {
          const isFav = favorites.some((f) => {
            if (!f.tailorId) return false;
            const tId = typeof f.tailorId === 'object' ? String((f.tailorId as any).id || (f.tailorId as any)._id) : String(f.tailorId);
            return tId === String(tailor.id);
          });

          return (
            <div key={tailor.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <button
                onClick={() => {
                  if (onToggleFavorite) onToggleFavorite(undefined, String(tailor.id));
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: isFav ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  zIndex: 10,
                }}
                title={isFav ? 'Remove tailor from favorites' : 'Save tailor to favorites'}
              >
                {isFav ? '❤️' : '🤍'}
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img
                    src={tailor.profileImage || 'https://via.placeholder.com/80'}
                    alt={tailor.businessName}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{tailor.businessName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-gold">★ {tailor.averageRating || 4.8}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({tailor.reviewCount || 30} reviews)</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '16px' }}>{tailor.description}</p>

                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '16px' }}>
                  📍 <strong>Location:</strong> {tailor.businessAddress || 'Addis Ababa'}
                </div>

                {/* Offered Services */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Services Offered:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {tailor.services?.map((service) => (
                      <span key={service} className="badge badge-cyan">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Request Bespoke Consultation ✉️
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

