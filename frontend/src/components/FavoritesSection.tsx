import React from 'react';
import type { FavoriteItem, ClothingProduct, Tailor } from '../types';
import { getKnownProduct } from '../services/api';

interface FavoritesSectionProps {
  favorites: FavoriteItem[];
  onRemoveFavorite: (favoriteId: string) => Promise<void>;
  onConfigureProduct?: (product: ClothingProduct) => void;
  onAddToCart?: (payload: {
    productId: string;
    tailorId: string;
    quantity: number;
    measurementProfileId: string;
    customization: Record<string, any>;
  }) => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favorites,
  onRemoveFavorite,
  onConfigureProduct,
  onAddToCart,
  onNavigateTab,
}) => {
  const garmentFavorites = favorites.filter((f) => f.productId);
  const tailorFavorites = favorites.filter((f) => f.tailorId);

  return (
    <section style={{ padding: '32px 0' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(90deg, #ec4899, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ❤️ Your Saved Favorites
          </h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            Your curated collection of favorited custom garments and master tailor workshops.
          </p>
        </div>
        <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          {favorites.length} {favorites.length === 1 ? 'Record' : 'Records'} Saved
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🤍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>No saved favorites yet</h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '480px', margin: '0 auto 24px auto' }}>
            Explore our bespoke catalog or verified master tailors and click the heart icon on any card to save it here.
          </p>
          {onNavigateTab && (
            <button className="btn-primary" onClick={() => onNavigateTab('catalog')} style={{ padding: '12px 24px' }}>
              Explore Garment Catalog ➔
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Garments Sub-section */}
          {garmentFavorites.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.25rem' }}>👗</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                  Saved Custom Garments ({garmentFavorites.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {garmentFavorites.map((fav) => {
                  const rawP = fav.productId;
                  const product: ClothingProduct = typeof rawP === 'object' && rawP !== null
                    ? (rawP as ClothingProduct)
                    : getKnownProduct(rawP as any);

                  const pId = String(product.id || product.productId);
                  const pName = product.name || 'Bespoke Garment';
                  const pImage = product.image || (product.images && product.images[0]) || '/sample_custom_tuxedo.jpg';
                  const pPrice = product.basePrice || 8500;
                  const favId = fav.id || fav.favoriteId || pId;

                  return (
                    <div
                      key={favId}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        borderRadius: '16px',
                        border: '1px solid rgba(236, 72, 153, 0.25)',
                      }}
                    >
                      {/* Unfavorite Heart Button */}
                      <button
                        onClick={() => onRemoveFavorite(favId)}
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#fff',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          zIndex: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        }}
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>

                      <div>
                        <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                          <img
                            src={pImage}
                            alt={pName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => {
                              e.target.src = '/sample_custom_tuxedo.jpg';
                            }}
                          />
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 6px 0' }}>{pName}</h4>
                        <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0 0 14px 0', minHeight: '36px' }}>
                          {product.description || 'Custom tailored garment handcrafted to your exact metrics.'}
                        </p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Starting Price:</span>
                          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f59e0b' }}>
                            {pPrice.toLocaleString()} {product.currency || 'ETB'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {onConfigureProduct && (
                            <button
                              className="btn-primary"
                              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '10px' }}
                              onClick={() => onConfigureProduct(product)}
                            >
                              Customize ➔
                            </button>
                          )}
                          {onAddToCart && (
                            <button
                              className="btn-secondary"
                              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '10px' }}
                              onClick={() =>
                                onAddToCart({
                                  productId: pId,
                                  tailorId: '1',
                                  quantity: 1,
                                  measurementProfileId: 'profile-1',
                                  customization: {
                                    fabric: product.fabricOptions?.[0] || 'Italian Pure Wool',
                                    color: product.colorOptions?.[0] || 'Midnight Navy',
                                  },
                                })
                              }
                            >
                              🛒 Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tailors Sub-section */}
          {tailorFavorites.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.25rem' }}>✂️</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#06b6d4', margin: 0 }}>
                  Saved Artisan Tailors ({tailorFavorites.length})
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {tailorFavorites.map((fav) => {
                  const tailor = fav.tailorId as Tailor;
                  if (!tailor) return null;

                  return (
                    <div
                      key={fav.id || fav.favoriteId}
                      className="glass-card"
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        borderRadius: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      <button
                        onClick={() => onRemoveFavorite(fav.id || fav.favoriteId || '')}
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#fff',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          zIndex: 10,
                        }}
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                          <img
                            src={tailor.profileImage || 'https://via.placeholder.com/80'}
                            alt={tailor.businessName}
                            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #06b6d4' }}
                          />
                          <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>{tailor.businessName}</h4>
                            <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                              ★ {tailor.averageRating || 4.9} Verified
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '0 0 12px 0' }}>{tailor.description}</p>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '14px' }}>
                          📍 {tailor.businessAddress || 'Bole Medhanealem, Addis Ababa'}
                        </div>
                      </div>

                      <button
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                        onClick={() => onNavigateTab && onNavigateTab('tailors')}
                      >
                        View Atelier Profile & Garments ➔
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

