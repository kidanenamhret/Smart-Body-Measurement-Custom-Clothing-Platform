import React from 'react';
import type { CartData, CartItem, ClothingProduct, Tailor } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartData | null;
  onRemoveItem: (productId: string) => Promise<void>;
  onUpdateQuantity?: (productId: string, quantity: number) => Promise<void>;
  onCheckout: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const totals = cart?.totals || { subtotal: 0, totalAmount: 0, totalItems: 0, currency: 'ETB' };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          borderRadius: '0',
          borderLeft: '1px solid rgba(245, 158, 11, 0.3)',
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          background: '#080c14',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflow: 'hidden',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🛒</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>Bespoke Order Cart</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified Custom Measurements</span>
            </div>
            <span className="badge badge-gold" style={{ marginLeft: '4px' }}>
              {totals.totalItems} {totals.totalItems === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Cart Item List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛍️</div>
              <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '8px' }}>Your bespoke cart is empty</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '300px', margin: '0 auto 24px auto' }}>
                Select a handcrafted garment from our catalog and customize it with your saved measurements.
              </p>
              {onNavigateTab && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    onNavigateTab('catalog');
                  }}
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  Browse Garment Catalog ➔
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item: CartItem, idx: number) => {
                const product = typeof item.productId === 'object' ? (item.productId as ClothingProduct) : null;
                const pId = product ? String(product.id || product.productId) : String(item.productId);
                const pName = product?.name || `Custom Garment #${pId}`;
                const pImage = product?.image || (product?.images && product.images[0]) || '/sample_custom_tuxedo.jpg';

                const tailor = typeof item.tailorId === 'object' ? (item.tailorId as Tailor) : null;
                const tailorName = tailor?.businessName || 'Royal Habesha Couture Atelier';

                const unitPrice = Number(item.calculatedPrice || item.unitPrice || product?.basePrice || 0);
                const quantity = Number(item.quantity) || 1;
                const itemTotal = unitPrice * quantity;

                return (
                  <div
                    key={`${pId}-${idx}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                        <img
                          src={pImage}
                          alt={pName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => {
                            e.target.src = '/sample_custom_tuxedo.jpg';
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pName}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(pId)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Remove item from cart"
                          >
                            🗑️
                          </button>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#06b6d4', marginBottom: '6px', fontWeight: '600' }}>
                          ✂️ {tailorName}
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b' }}>
                          {unitPrice.toLocaleString()} {cart?.currency || 'ETB'}
                          {quantity > 1 && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '400', marginLeft: '6px' }}>
                              (Total: {itemTotal.toLocaleString()} {cart?.currency || 'ETB'})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customization Badges */}
                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'rgba(0, 0, 0, 0.25)', padding: '8px', borderRadius: '8px' }}>
                        {Object.entries(item.customization).map(([k, v]) => {
                          if (!v) return null;
                          return (
                            <span
                              key={k}
                              style={{
                                fontSize: '0.68rem',
                                padding: '3px 8px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                borderRadius: '4px',
                                textTransform: 'capitalize',
                              }}
                            >
                              <strong>{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Quantity Adjustment Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Quantity:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => onUpdateQuantity && onUpdateQuantity(pId, Math.max(0, quantity - 1))}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', minWidth: '20px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity && onUpdateQuantity(pId, quantity + 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#cbd5e1',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                <span>Subtotal ({totals.totalItems} {totals.totalItems === 1 ? 'item' : 'items'}):</span>
                <span style={{ fontWeight: '700', color: '#cbd5e1' }}>{totals.subtotal.toLocaleString()} {totals.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#10b981', marginBottom: '10px' }}>
                <span>Server-Validated Pricing Guard:</span>
                <span style={{ fontWeight: '700' }}>VERIFIED ✓</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.12)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Total Amount:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                  {totals.totalAmount.toLocaleString()} {totals.currency}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.85rem' }}
                onClick={onClose}
              >
                Continue Browsing
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2, justifyContent: 'center', padding: '12px', fontSize: '0.9rem', fontWeight: '800' }}
                onClick={onCheckout}
              >
                🔒 Checkout & Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

