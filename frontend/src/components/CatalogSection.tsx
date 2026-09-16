import React, { useState, useEffect } from 'react';
import type { ClothingProduct, ClothingCategory, FavoriteItem, MeasurementProfile } from '../types';
import { fetchDatabaseCategories, fetchProducts } from '../services/api';
import { GarmentDetailModal } from './GarmentDetailModal';

interface CatalogSectionProps {
  products: ClothingProduct[];
  favorites?: FavoriteItem[];
  profiles?: MeasurementProfile[];
  onToggleFavorite?: (productId?: string, tailorId?: string) => Promise<void>;
  onAddToCart?: (payload: {
    productId: string;
    tailorId: string;
    quantity: number;
    measurementProfileId: string;
    customization: Record<string, any>;
  }) => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products: initialProducts,
  favorites = [],
  profiles = [],
  onToggleFavorite,
  onAddToCart,
  onNavigateTab,
}) => {
  const [categories, setCategories] = useState<ClothingCategory[]>([]);
  const [productList, setProductList] = useState<ClothingProduct[]>(initialProducts);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  // Selected Product for 2-column Garment Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<ClothingProduct | null>(null);

  // New product form state for tailor/admin
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductCategory, setNewProductCategory] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<number>(8500);
  const [newProductDescription, setNewProductDescription] = useState<string>('');
  const [newProductFabrics, setNewProductFabrics] = useState<string>('Pure Wool, Egyptian Cotton, Linen');
  const [newProductColors, setNewProductColors] = useState<string>('Midnight Navy, Charcoal Grey, Deep Emerald');
  const [newProductTime, setNewProductTime] = useState<number>(7);
  const [newProductSuccess, setNewProductSuccess] = useState<string>('');

  useEffect(() => {
    fetchDatabaseCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !newProductCategory) {
        setNewProductCategory(cats[0].id);
      }
    });

    fetchProducts().then((prods) => {
      if (prods && prods.length > 0) {
        setProductList(prods);
      }
    });
  }, []);

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategoryId(catId);
    if (catId === 'ALL') {
      fetchProducts().then((prods) => setProductList(prods));
    } else {
      fetchProducts(catId).then((prods) => {
        setProductList(prods);
      });
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdProduct: ClothingProduct = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      productId: `prod-${Date.now().toString().slice(-4)}`,
      name: newProductName,
      categoryId: newProductCategory,
      description: newProductDescription || 'Handcrafted bespoke garment',
      basePrice: newProductPrice,
      currency: 'ETB',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80'],
      fabricOptions: newProductFabrics.split(',').map((s) => s.trim()),
      colorOptions: newProductColors.split(',').map((s) => s.trim()),
      requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength'],
      productionTimeDays: newProductTime,
      productionTime: `${newProductTime} days`,
      availabilityStatus: 'ACTIVE',
    };

    setProductList([createdProduct, ...productList]);
    setIsAddingProduct(false);
    setNewProductSuccess(`New garment '${createdProduct.name}' added to catalog!`);
    setTimeout(() => setNewProductSuccess(''), 4000);
  };

  return (
    <section style={{ padding: '32px 0' }}>
      {/* 1. CUSTOMER-FACING HEADER */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: '#f8fafc' }}>
            Find Your Perfect Garment
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0, maxWidth: '650px' }}>
            Choose a garment, customize every detail, and order it using your saved measurements.
          </p>

          {/* Discreet Admin/Developer Status Indicator */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ✓ Prices verified
            </span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              ✓ Tailor-defined customization
            </span>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => setIsAddingProduct(!isAddingProduct)} style={{ fontSize: '0.85rem' }}>
          {isAddingProduct ? 'Cancel' : '➕ Tailor: Add New Product'}
        </button>
      </div>

      {/* 2. PROMINENT MEASUREMENT CTA BANNER */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.4rem' }}>📏</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              Don't have your measurements yet?
            </h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
            Measure yourself from home using our guided process or mobile camera scan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => onNavigateTab && onNavigateTab('measurements')}
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            📱 AI-Assisted Camera Scan
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigateTab && onNavigateTab('measurements')}
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            ✏️ Enter Manually
          </button>
        </div>
      </div>

      {newProductSuccess && (
        <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' }}>
          ✅ {newProductSuccess}
        </div>
      )}

      {/* Add Product Form */}
      {isAddingProduct && (
        <form className="glass-card" style={{ padding: '28px', marginBottom: '32px', border: '1px solid #f59e0b' }} onSubmit={handleAddProductSubmit}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#f59e0b' }}>Create New Garment Product</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Product Name:</label>
              <input type="text" required value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="e.g. Bespoke Velvet Blazer" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Category:</label>
              <select value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Base Price (ETB):</label>
              <input type="number" required value={newProductPrice} onChange={(e) => setNewProductPrice(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Lead Time (Days):</label>
              <input type="number" value={newProductTime} onChange={(e) => setNewProductTime(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Description:</label>
              <input type="text" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} placeholder="Craftsmanship details..." style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Fabrics (comma separated):</label>
              <input type="text" value={newProductFabrics} onChange={(e) => setNewProductFabrics(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Colors (comma separated):</label>
              <input type="text" value={newProductColors} onChange={(e) => setNewProductColors(e.target.value)} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Product 💾</button>
        </form>
      )}

      {/* Categories Filter Bar */}
      <div 
        style={{ 
          marginBottom: '28px', 
          overflowX: 'auto', 
          paddingBottom: '12px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
          <button
            onClick={() => handleCategoryFilter('ALL')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: selectedCategoryId === 'ALL' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              background: selectedCategoryId === 'ALL' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: selectedCategoryId === 'ALL' ? '#f59e0b' : '#94a3b8',
              fontWeight: selectedCategoryId === 'ALL' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            All Garments ({productList.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '9999px',
                border: selectedCategoryId === cat.id ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedCategoryId === cat.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedCategoryId === cat.id ? '#06b6d4' : '#94a3b8',
                fontWeight: selectedCategoryId === cat.id ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. INFORMATION-RICH PRODUCT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
        {productList.map((product) => {
          const isFav = favorites.some((f) => {
            if (!f.productId) return false;
            const pId = typeof f.productId === 'object' ? String((f.productId as any).id || (f.productId as any)._id) : String(f.productId);
            return pId === String(product.id || product.productId);
          });

          return (
            <div
              key={product.id}
              className="glass-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image & Badges */}
              <div style={{ aspectRatio: '3/4', width: '100%', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
                <img
                  src={product.image || '/sample_custom_tuxedo.jpg'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Lead Time Badge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#f59e0b',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  ⏱ Production: {product.productionTime || `${product.productionTimeDays || 7} days`}
                </span>

                {/* Favorite Heart Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) onToggleFavorite(String(product.id || product.productId), undefined);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: isFav ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {isFav ? '❤️' : '♡'}
                </button>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Rating & Bespoke Tailor Label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '800' }}>
                      ★★★★★ 4.9
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                      Bespoke Tailor
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px 0' }}>
                    {product.name}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '14px' }}>
                    Starting from <strong style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{product.basePrice.toLocaleString()} {product.currency || 'ETB'}</strong>
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '600' }}>
                      ✓ Custom measured
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '600' }}>
                      ✓ Fabric selection ({product.fabricOptions?.length || 3} choices)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '600' }}>
                      ✓ Color customization ({product.colorOptions?.length || 4} shades)
                    </span>
                  </div>
                </div>

                {/* Primary CTA: Customize & Order */}
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem', fontWeight: '800' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                >
                  Customize & Order ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. GARMENT DETAIL & CUSTOMIZATION MODAL */}
      {selectedProduct && (
        <GarmentDetailModal
          product={selectedProduct}
          profiles={profiles}
          isFavorite={favorites.some((f) => {
            if (!f.productId) return false;
            const pId = typeof f.productId === 'object' ? String((f.productId as any).id || (f.productId as any).productId || (f.productId as any)._id) : String(f.productId);
            return pId === String(selectedProduct.id || selectedProduct.productId);
          })}
          onToggleFavorite={async (pId) => {
            if (onToggleFavorite) await onToggleFavorite(pId);
          }}
          onClose={() => setSelectedProduct(null)}
          onConfirmOrder={async (payload) => {
            if (onAddToCart) {
              await onAddToCart(payload);
            }
            setSelectedProduct(null);
          }}
        />
      )}
    </section>
  );
};
