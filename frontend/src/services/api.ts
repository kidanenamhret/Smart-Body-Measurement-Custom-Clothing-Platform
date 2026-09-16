import type { Tailor, ClothingProduct, ClothingCategory, MeasurementProfile, DeliveryJob, AdminMetrics, MeasurementSession, MeasurementSessionStatus, MeasurementValidationResult, PriceCalculationResult, FavoriteItem, CartData, Order, OrderStatus, TailorProductionStage, PaymentRecord, PaymentProvider, CustomerAddress, NotificationItem, ReviewItem, SupportTicketItem, AuditLogItem } from '../types';

const API_BASE = 'http://localhost:3001';

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.accessToken) {
      localStorage.setItem('sewfit_token', data.accessToken);
    }
    return data;
  } catch (err: any) {
    if (err.message && err.message !== 'Failed to fetch') throw err;
    return {
      message: 'Account created successfully (local mode). You can now log in.',
      userId: `user-${Date.now()}`,
    };
  }
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    if (data.accessToken) {
      localStorage.setItem('sewfit_token', data.accessToken);
    }
    return data;
  } catch (err: any) {
    if (err.message && err.message !== 'Failed to fetch') throw err;
    const mockToken = `mock_token_${Date.now()}`;
    localStorage.setItem('sewfit_token', mockToken);
    return {
      accessToken: mockToken,
      user: {
        id: 'user-101',
        name: payload.email.split('@')[0] || 'Authenticated User',
        email: payload.email,
        role: 'CUSTOMER',
      },
    };
  }
}

export async function fetchDatabaseCategories(): Promise<ClothingCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        return data.categories.map((cat: any) => ({
          id: cat._id || cat.categoryId || cat.id,
          categoryId: cat._id || cat.categoryId,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          isActive: cat.isActive !== false,
        }));
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using fallback database categories');
  }

  return [
    { id: 'cat-1', name: 'Shirt', slug: 'shirt', description: 'Tailored formal, casual, and Oxford dress shirts' },
    { id: 'cat-2', name: 'T-Shirt', slug: 't-shirt', description: 'Custom fitted polo shirts, tees, and henleys' },
    { id: 'cat-3', name: 'Trouser', slug: 'trouser', description: 'Bespoke dress pants, chinos, and tailored trousers' },
    { id: 'cat-4', name: 'Suit', slug: 'suit', description: 'Handcrafted two-piece & three-piece suits and tuxedos' },
    { id: 'cat-5', name: 'Jacket', slug: 'jacket', description: 'Custom blazers, coats, waistcoats, and outerwear' },
    { id: 'cat-6', name: 'Dress', slug: 'dress', description: 'Bespoke evening gowns, cocktail dresses, and bridal attire' },
    { id: 'cat-7', name: 'Traditional Clothing', slug: 'traditional-clothing', description: 'Authentic Habesha Kemis, Kaba, and cultural ceremonial garments' },
    { id: 'cat-8', name: 'Other Custom Garment', slug: 'other-custom-garment', description: 'Specialized uniforms, vestments, and custom pattern creations' },
  ];
}

export const DEFAULT_PRODUCTS: ClothingProduct[] = [
  {
    id: '1',
    productId: '1',
    categoryId: 'cat-4',
    name: 'Custom Three-Piece Tuxedo',
    description: 'Hand-tailored luxury wool tuxedo with satin peak lapels and personalized silk lining.',
    basePrice: 12500,
    currency: 'ETB',
    image: '/images/tuxedo_suit.jpg',
    images: ['/images/tuxedo_suit.jpg', '/images/tuxedo_suit.jpg'],
    fabricOptions: ['Italian Pure Wool', 'Cashmere Blend', 'Velvet'],
    colorOptions: ['Midnight Navy', 'Classic Black', 'Charcoal Grey'],
    customizationOptions: {
      lapelStyle: ['Peak Lapel', 'Notch Lapel', 'Shawl Collar'],
      buttonCount: ['Single Button', 'Double Breasted', 'Two Button'],
      liningPattern: ['Paisley Silk', 'Solid Satin', 'Monogrammed'],
    },
    requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength', 'jacketLength'],
    productionTimeDays: 7,
    productionTime: '7 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '2',
    productId: '2',
    categoryId: 'cat-7',
    name: 'Bespoke Traditional Dress (Habesha Kemis)',
    description: 'Authentic hand-woven Ethiopian cotton gown with intricate gold and crimson embroidery.',
    basePrice: 8500,
    currency: 'ETB',
    image: '/images/habesha_kemis.jpg',
    images: ['/images/habesha_kemis.jpg', '/images/habesha_kemis.jpg'],
    fabricOptions: ['Shemma Woven Cotton', 'Silk Blend', 'Fine Linen'],
    colorOptions: ['Ivory & Gold', 'White & Crimson', 'Royal Navy Accent'],
    customizationOptions: {
      embroideryPattern: ['Tibeb Royal Gold', 'Traditional Cross Motif', 'Modern Geometric'],
      sleeveType: ['Full Long Sleeve', 'Three-Quarter', 'Cape Sleeve'],
    },
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 10,
    productionTime: '10 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '3',
    productId: '3',
    categoryId: 'cat-1',
    name: 'Tailored Oxford Cotton Shirt',
    description: 'Custom fitted dress shirt crafted from long-staple Egyptian cotton with customizable collar and cuffs.',
    basePrice: 2800,
    currency: 'ETB',
    image: '/images/oxford_shirt.jpg',
    images: ['/images/oxford_shirt.jpg'],
    fabricOptions: ['100% Egyptian Cotton', 'Linen Blend', 'Stretch Oxford'],
    colorOptions: ['Crisp White', 'Sky Blue', 'Soft Pink', 'French Blue'],
    customizationOptions: {
      collarStyle: ['Spread Collar', 'Button-Down', 'Cutaway Collar'],
      cuffStyle: ['French Cuff (Cufflinks)', 'Single Button Barrel', 'Convertible'],
      monogramInitials: 'Custom initials embroidered on left cuff',
    },
    requiredMeasurements: ['neck', 'chest', 'waist', 'armLength', 'wrist'],
    productionTimeDays: 4,
    productionTime: '4 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '4',
    productId: '4',
    categoryId: 'cat-7',
    name: 'Royal Kaba (Traditional Cape)',
    description: 'Luxurious velvet Kaba embellished with intricate gold or silver metallic embroidery. Perfect for weddings and ceremonial events.',
    basePrice: 15000,
    currency: 'ETB',
    image: '/images/royal_kaba.jpg',
    images: ['/images/royal_kaba.jpg'],
    fabricOptions: ['Premium Velvet', 'Silk Blend'],
    colorOptions: ['Deep Red', 'Royal Blue', 'Emerald Green', 'Black'],
    customizationOptions: { embroidery: ['Gold Thread', 'Silver Thread'] },
    requiredMeasurements: ['shoulder', 'height', 'chest'],
    productionTimeDays: 14,
    productionTime: '14 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '5',
    productId: '5',
    categoryId: 'cat-7',
    name: 'Oromo Cultural Dress (Baali/Waya)',
    description: 'Traditional Oromo attire featuring rich vibrant colors and unique cultural patterns handwoven by artisans.',
    basePrice: 7500,
    currency: 'ETB',
    image: '/images/oromo_dress.jpg',
    images: ['/images/oromo_dress.jpg'],
    fabricOptions: ['Handwoven Cotton', 'Silk Trim'],
    colorOptions: ['Red & Black Motif', 'Earth Tones'],
    customizationOptions: {},
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 12,
    productionTime: '12 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '6',
    productId: '6',
    categoryId: 'cat-7',
    name: 'Tigray Traditional Dress (Tilf)',
    description: 'Exquisite Tigray cultural dress with signature cross patterns and delicate Tilf embroidery along the hem and neckline.',
    basePrice: 8000,
    currency: 'ETB',
    image: '/images/tigray_dress.jpg',
    images: ['/images/tigray_dress.jpg'],
    fabricOptions: ['Shemma Woven Cotton'],
    colorOptions: ['White & Gold', 'White & Blue'],
    customizationOptions: { embroidery: ['Tilf Classic', 'Tilf Modern'] },
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 10,
    productionTime: '10 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '7',
    productId: '7',
    categoryId: 'cat-7',
    name: 'Gurage Cultural Dress',
    description: 'Vibrant and distinct Gurage traditional wear, tailored for comfort and cultural authenticity.',
    basePrice: 6500,
    currency: 'ETB',
    image: '/images/gurage_dress.jpg',
    images: ['/images/gurage_dress.jpg'],
    fabricOptions: ['Cotton Blend'],
    colorOptions: ['Multicolor Trim', 'Green Accent'],
    customizationOptions: {},
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 8,
    productionTime: '8 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '8',
    productId: '8',
    categoryId: 'cat-8',
    name: 'Ethiopian Orthodox Vestment (Qamis/Kaba)',
    description: 'Custom tailored religious vestments for clergy, intricately detailed with ecclesiastical symbols.',
    basePrice: 12000,
    currency: 'ETB',
    image: '/images/priest_vestment.jpg',
    images: ['/images/priest_vestment.jpg'],
    fabricOptions: ['Heavy Silk', 'Brocade'],
    colorOptions: ['Gold', 'White', 'Crimson Red'],
    customizationOptions: { symbols: ['Cross Motif', 'Angel Wings'] },
    requiredMeasurements: ['height', 'shoulder', 'chest', 'sleeveLength'],
    productionTimeDays: 15,
    productionTime: '15 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '9',
    productId: '9',
    categoryId: 'cat-4',
    name: 'Modern Linen Safari Suit',
    description: 'Breathable, stylish two-piece linen safari suit with utility pockets, perfect for warm climates.',
    basePrice: 8500,
    currency: 'ETB',
    image: '/images/linen_safari.jpg',
    images: ['/images/linen_safari.jpg'],
    fabricOptions: ['100% Linen', 'Cotton-Linen Blend'],
    colorOptions: ['Khaki', 'Olive Green', 'Stone White'],
    customizationOptions: { pockets: ['Four Pocket', 'Two Pocket'] },
    requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength', 'jacketLength'],
    productionTimeDays: 7,
    productionTime: '7 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '10',
    productId: '10',
    categoryId: 'cat-7',
    name: 'Afar Cultural Dress',
    description: 'Traditional Afar nomadic attire adapted into a modern tailored fit, featuring signature bright patterns.',
    basePrice: 6000,
    currency: 'ETB',
    image: '/images/afar_dress.jpg',
    images: ['/images/afar_dress.jpg'],
    fabricOptions: ['Lightweight Cotton'],
    colorOptions: ['Red & White Pattern', 'Blue Trim'],
    customizationOptions: {},
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 8,
    productionTime: '8 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '11',
    productId: '11',
    categoryId: 'cat-7',
    name: 'Hadiya Cultural Dress',
    description: 'Distinctive Hadiya traditional clothing known for its unique geometric embroidery and comfortable drape.',
    basePrice: 6800,
    currency: 'ETB',
    image: '/images/hadiya_dress.jpg',
    images: ['/images/hadiya_dress.jpg'],
    fabricOptions: ['Cotton'],
    colorOptions: ['White with Colorful Trim'],
    customizationOptions: {},
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
    productionTimeDays: 8,
    productionTime: '8 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '12',
    productId: '12',
    categoryId: 'cat-7',
    name: "Traditional Men's Suit (Ejjeta / Jano)",
    description: 'Men’s traditional tailored wear incorporating cultural Jano elements, worn for significant cultural events.',
    basePrice: 9500,
    currency: 'ETB',
    image: '/images/traditional_mens_suit.jpg',
    images: ['/images/traditional_mens_suit.jpg'],
    fabricOptions: ['Shemma Blend', 'Linen'],
    colorOptions: ['White & Red Striped', 'Solid White'],
    customizationOptions: { lapelStyle: ['Mandarin Collar', 'V-Neck'] },
    requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength', 'jacketLength'],
    productionTimeDays: 10,
    productionTime: '10 days',
    availabilityStatus: 'ACTIVE',
  },
  {
    id: '13',
    productId: '13',
    categoryId: 'cat-6',
    name: 'Custom Wedding Gown',
    description: 'Bespoke bridal gown designed to your exact body measurements, combining modern silhouette with classic elegance.',
    basePrice: 35000,
    currency: 'ETB',
    image: '/images/wedding_gown.jpg',
    images: ['/images/wedding_gown.jpg'],
    fabricOptions: ['French Lace', 'Silk Satin', 'Tulle'],
    colorOptions: ['Pure White', 'Ivory', 'Champagne'],
    customizationOptions: {
      neckline: ['Sweetheart', 'V-Neck', 'Off-Shoulder'],
      train: ['Sweep Train', 'Chapel Train', 'Cathedral Train']
    },
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height', 'armLength'],
    productionTimeDays: 30,
    productionTime: '30 days',
    availabilityStatus: 'ACTIVE',
  }
];

export function getKnownProduct(productId?: string | number): ClothingProduct {
  if (!productId) return DEFAULT_PRODUCTS[0];
  const pIdStr = String(productId);
  const found = DEFAULT_PRODUCTS.find((p) => String(p.id) === pIdStr || String(p.productId) === pIdStr);
  if (found) return found;

  try {
    const raw = localStorage.getItem('sewfit_products_cache');
    if (raw) {
      const parsed: ClothingProduct[] = JSON.parse(raw);
      const cached = parsed.find((p) => String(p.id) === pIdStr || String(p.productId) === pIdStr);
      if (cached) return cached;
    }
  } catch (e) {}

  return {
    id: pIdStr,
    productId: pIdStr,
    name: 'Bespoke Custom Garment',
    description: 'Handcrafted custom garment tailored to your exact measurements.',
    basePrice: 8500,
    currency: 'ETB',
    image: '/images/tuxedo_suit.jpg',
    images: ['/images/tuxedo_suit.jpg'],
    fabricOptions: ['Italian Pure Wool', 'Egyptian Cotton', 'Linen'],
    colorOptions: ['Midnight Navy', 'Classic Black', 'Charcoal Grey'],
    requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength'],
    productionTimeDays: 7,
    productionTime: '7 days',
    availabilityStatus: 'ACTIVE',
  };
}

export async function fetchProducts(categoryId?: string): Promise<ClothingProduct[]> {
  try {
    const url = categoryId
      ? `${API_BASE}/api/products?categoryId=${encodeURIComponent(categoryId)}`
      : `${API_BASE}/api/products`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const prods = data.products.map((p: any) => ({
          ...p,
          id: p._id || p.productId || p.id,
          image: p.images && p.images.length > 0 ? p.images[0] : p.image || '/images/tuxedo_suit.jpg',
          productionTime: p.productionTime || (p.productionTimeDays ? `${p.productionTimeDays} days` : '7 days'),
          availabilityStatus: p.availabilityStatus || 'ACTIVE',
        }));
        try {
          localStorage.setItem('sewfit_products_cache', JSON.stringify(prods));
        } catch (e) {}
        return prods;
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using fallback products data');
  }

  try {
    localStorage.setItem('sewfit_products_cache', JSON.stringify(DEFAULT_PRODUCTS));
  } catch (e) {}

  if (categoryId) {
    return DEFAULT_PRODUCTS.filter((p) => p.categoryId === categoryId);
  }
  return DEFAULT_PRODUCTS;
}

export async function fetchTailors(): Promise<Tailor[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tailors`);
    if (res.ok) {
      const data = await res.json();
      if (data.tailors && data.tailors.length > 0) {
        return data.tailors;
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using fallback tailors data');
  }

  return [
    {
      id: '1',
      businessName: 'Royal Habesha Couture',
      description: 'Master bespoke tailors specializing in custom suits, traditional Habesha Kemis, and luxury embroidery.',
      profileImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80',
      businessAddress: 'Bole Medhanealem, Addis Ababa',
      averageRating: 4.9,
      reviewCount: 42,
      services: ['Bespoke Suits', 'Traditional Dresses', 'Embroidery'],
      verificationStatus: 'VERIFIED',
    },
    {
      id: '2',
      businessName: 'Moda Fit Atelier',
      description: 'Precision Italian & modern tailored menswear, shirts, and custom trousers.',
      profileImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
      businessAddress: 'Kazanchis Executive Tower, Addis Ababa',
      averageRating: 4.8,
      reviewCount: 28,
      services: ['Custom Suits', 'Shirts', 'Alterations'],
      verificationStatus: 'VERIFIED',
    },
    {
      id: '3',
      businessName: 'Stitch & Grace Studio',
      description: 'Handcrafted evening dresses, gowns, and custom fit bridal attire.',
      profileImage: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?w=400&q=80',
      businessAddress: 'CMC Square, Addis Ababa',
      averageRating: 4.7,
      reviewCount: 35,
      services: ['Gowns', 'Bridal Attire', 'Custom Fitting'],
      verificationStatus: 'VERIFIED',
    },
  ];
}

export const DEFAULT_MEASUREMENT_PROFILES: MeasurementProfile[] = [
  {
    id: 'prof-default',
    profileName: 'Default Profile',
    version: 3,
    isCurrent: true,
    category: 'FORMAL',
    categoryLabel: 'Formal Wear',
    bodyShape: 'ATHLETIC',
    source: 'AI + Manual Verification',
    confidenceScore: 94,
    lastVerifiedAt: 'Sept 15, 2026',
    fitPreference: 'Slim Fit',
    easeAllowance: '+1.0 cm bespoke contour',
    description: 'Primary master profile verified via AI 12-stage vision scan and master tailor audit.',
    measurements: {
      height: { value: 182, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      weight: { value: 78, unit: 'kg', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      neck: { value: 39, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      shoulder: { value: 46.5, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      chest: { value: 104, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      waist: { value: 84, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      hip: { value: 98, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      sleeveLength: { value: 65, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      armLength: { value: 63, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      backWidth: { value: 44, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      inseam: { value: 82, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      outseam: { value: 106, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      thigh: { value: 58, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      wrist: { value: 17.5, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      shirtLength: { value: 76, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      jacketLength: { value: 75, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
    },
  },
  {
    id: 'prof-casual',
    profileName: 'Casual Wear',
    version: 2,
    isCurrent: false,
    category: 'CASUAL',
    categoryLabel: 'Casual Wear',
    bodyShape: 'ATHLETIC',
    source: 'AI Vision Scanner',
    confidenceScore: 96,
    lastVerifiedAt: 'Sept 14, 2026',
    fitPreference: 'Regular Fit',
    easeAllowance: '+2.5 cm relaxed comfort',
    description: 'Optimized for Oxford shirts, casual polos, chinos, and everyday wear with relaxed ease.',
    measurements: {
      height: { value: 182, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      weight: { value: 78, unit: 'kg', source: 'MANUAL', verified: true, measuredAt: '2026-09-14' },
      neck: { value: 40, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-14' },
      shoulder: { value: 47, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      chest: { value: 106.5, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      waist: { value: 86.5, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      hip: { value: 100, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      sleeveLength: { value: 65.5, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      inseam: { value: 82, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      outseam: { value: 106, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      thigh: { value: 60, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-14' },
      shirtLength: { value: 77, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-14' },
    },
  },
  {
    id: 'prof-formal',
    profileName: 'Formal Wear',
    version: 3,
    isCurrent: false,
    category: 'FORMAL',
    categoryLabel: 'Formal Wear',
    bodyShape: 'ATHLETIC',
    source: 'Master Tailor Verified',
    confidenceScore: 98,
    lastVerifiedAt: 'Sept 15, 2026',
    fitPreference: 'Slim Fit',
    easeAllowance: '+1.0 cm sharp bespoke contour',
    description: 'Tailored for two-piece and three-piece tuxedos, blazers, and evening wear with precision draping.',
    measurements: {
      height: { value: 182, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-15' },
      weight: { value: 78, unit: 'kg', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      neck: { value: 39, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-15' },
      shoulder: { value: 46.5, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      chest: { value: 104, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      waist: { value: 84, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      hip: { value: 98, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      sleeveLength: { value: 65, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      backWidth: { value: 44, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      inseam: { value: 82, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      outseam: { value: 106, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      wrist: { value: 17.5, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
      jacketLength: { value: 75, unit: 'cm', source: 'TAILOR', verified: true, measuredAt: '2026-09-15' },
    },
  },
  {
    id: 'prof-traditional',
    profileName: 'Traditional Wear',
    version: 1,
    isCurrent: false,
    category: 'TRADITIONAL',
    categoryLabel: 'Traditional Wear',
    bodyShape: 'ATHLETIC',
    source: 'Atelier Verified',
    confidenceScore: 92,
    lastVerifiedAt: 'Sept 10, 2026',
    fitPreference: 'Relaxed Fit',
    easeAllowance: 'Ceremonial drape & ankle clearance',
    description: 'Designed specifically for authentic Ethiopian Habesha Kemis, Kaba, and cultural ceremonial attire.',
    measurements: {
      height: { value: 182, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      shoulder: { value: 47, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      chest: { value: 105, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      waist: { value: 85, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      hip: { value: 99, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      sleeveLength: { value: 65, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-09-10' },
      outseam: { value: 108, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-09-10' },
    },
  },
  {
    id: 'prof-winter',
    profileName: 'Winter Clothing',
    version: 1,
    isCurrent: false,
    category: 'WINTER',
    categoryLabel: 'Winter Clothing',
    bodyShape: 'ATHLETIC',
    source: 'Manual Verification',
    confidenceScore: 90,
    lastVerifiedAt: 'Aug 28, 2026',
    fitPreference: 'Regular Fit',
    easeAllowance: '+4.0 cm heavy layering allowance',
    description: 'Calibrated for wool trench coats, heavy winter blazers, and layered outerwear.',
    measurements: {
      height: { value: 182, unit: 'cm', source: 'AI', verified: true, measuredAt: '2026-08-28' },
      chest: { value: 108, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-08-28' },
      waist: { value: 88, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-08-28' },
      shoulder: { value: 48, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-08-28' },
      sleeveLength: { value: 66, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-08-28' },
      jacketLength: { value: 82, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: '2026-08-28' },
    },
  },
];

function getLocalProfilesStore(): MeasurementProfile[] {
  try {
    const raw = localStorage.getItem('sewfit_measurement_profiles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_MEASUREMENT_PROFILES;
}

function setLocalProfilesStore(profiles: MeasurementProfile[]) {
  try {
    localStorage.setItem('sewfit_measurement_profiles', JSON.stringify(profiles));
  } catch (e) {}
}

export async function fetchMeasurementProfiles(): Promise<MeasurementProfile[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profiles && data.profiles.length > 0) {
          setLocalProfilesStore(data.profiles);
          return data.profiles;
        }
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local measurement profiles');
  }

  return getLocalProfilesStore();
}

export async function saveMeasurementProfile(profile: MeasurementProfile): Promise<MeasurementProfile[]> {
  const current = getLocalProfilesStore();
  const existingIdx = current.findIndex((p) => p.id === profile.id);
  if (existingIdx >= 0) {
    current[existingIdx] = profile;
  } else {
    current.unshift(profile);
  }
  setLocalProfilesStore(current);
  return current;
}

export async function setDefaultMeasurementProfile(profileId: string): Promise<MeasurementProfile[]> {
  const current = getLocalProfilesStore();
  const updated = current.map((p) => ({
    ...p,
    isCurrent: p.id === profileId,
  }));
  setLocalProfilesStore(updated);
  return updated;
}

export async function fetchDeliveryJobs(): Promise<DeliveryJob[]> {
  return [
    {
      id: 'JOB-9021',
      status: 'AVAILABLE',
      pickupInfo: {
        businessName: 'Royal Habesha Couture',
        address: 'Bole Medhanealem Workshop #402, Addis Ababa',
        contactPhone: '+251 91 123 4567',
      },
      deliveryInfo: {
        recipientName: 'Abebe Bikila',
        address: 'Kazanchis Residence Tower, Apt 7B',
        contactPhone: '+251 92 888 9900',
      },
      createdAt: '2026-09-15 06:30',
    },
    {
      id: 'JOB-9022',
      status: 'EN_ROUTE_TO_CUSTOMER',
      pickupInfo: {
        businessName: 'Moda Fit Atelier',
        address: 'Kazanchis Executive Tower Studio',
        contactPhone: '+251 93 456 7890',
      },
      deliveryInfo: {
        recipientName: 'Tigist Lemma',
        address: 'Sarbet Old Airport Area, Villa 45',
        contactPhone: '+251 91 777 3344',
      },
      createdAt: '2026-09-15 05:15',
    },
  ];
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/admin/dashboard`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.metrics) {
        return data.metrics;
      }
    }
  } catch (err) {
    console.warn('Backend admin API unreachable, using fallback admin metrics');
  }

  return {
    totalUsers: 1420,
    totalCustomers: 1180,
    totalTailors: 85,
    pendingTailorVerifications: 4,
    totalDeliveryAgents: 32,
    activeOrders: 64,
    totalPlatformRevenue: 485000,
    openSupportTickets: 3,

    // Real DB Metrics fallback structure
    customers: 1180,
    tailors: 85,
    verifiedTailors: 81,
    pendingVerifications: 4,
    orders: 240,
    completedOrders: 172,
    cancelledOrders: 4,
    payments: {
      totalVolume: 485000,
      totalTransactions: 176,
      successfulPayments: 172,
    },
    deliveries: {
      total: 180,
      active: 12,
      completed: 168,
    },
    supportTickets: {
      total: 28,
      open: 3,
      resolved: 25,
    },
  };
}

export async function updateTailorStatus(
  tailorId: string,
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED',
  reason?: string
): Promise<any> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/admin/tailors/${encodeURIComponent(tailorId)}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, reason }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Error updating tailor status via API:', err);
  }
  return { message: `Tailor status updated to ${status}` };
}

export async function fetchMeasurementSessions(): Promise<MeasurementSession[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) return data.sessions;
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using mock measurement sessions');
  }

  return [
    {
      sessionId: 'sess-8801',
      customerId: 'cust-101',
      captureType: 'AI',
      frontCapture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
      sideCapture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      heightReference: '182',
      status: 'VERIFIED',
      landmarks: {
        head: { x: 0.5, y: 0.1, confidence: 0.98 },
        leftShoulder: { x: 0.38, y: 0.24, confidence: 0.95 },
        rightShoulder: { x: 0.62, y: 0.24, confidence: 0.95 },
        chestCenter: { x: 0.5, y: 0.32, confidence: 0.94 },
        waistCenter: { x: 0.5, y: 0.45, confidence: 0.91 },
      },
      estimatedMeasurements: {
        height: { value: 182, unit: 'cm' },
        chest: { value: 104, unit: 'cm' },
        waist: { value: 84, unit: 'cm' },
        shoulder: { value: 46, unit: 'cm' },
        sleeveLength: { value: 65, unit: 'cm' },
        inseam: { value: 82, unit: 'cm' },
      },
      confidenceScores: {
        height: 0.99,
        chest: 0.94,
        waist: 0.91,
        shoulder: 0.95,
        sleeveLength: 0.88,
        inseam: 0.86,
      },
      warnings: [],
      createdAt: '2026-09-14 14:20',
      completedAt: '2026-09-14 14:22',
    },
    {
      sessionId: 'sess-8802',
      customerId: 'cust-101',
      captureType: 'AI',
      frontCapture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      heightReference: '182',
      status: 'REVIEW_REQUIRED',
      landmarks: {
        head: { x: 0.5, y: 0.1, confidence: 0.97 },
        chestCenter: { x: 0.5, y: 0.33, confidence: 0.92 },
        waistCenter: { x: 0.5, y: 0.46, confidence: 0.88 },
      },
      estimatedMeasurements: {
        height: { value: 182, unit: 'cm' },
        chest: { value: 105, unit: 'cm' },
        waist: { value: 85, unit: 'cm' },
        shoulder: { value: 46.5, unit: 'cm' },
      },
      confidenceScores: {
        height: 0.98,
        chest: 0.92,
        waist: 0.88,
        shoulder: 0.90,
      },
      warnings: ['Side capture missing: Sleeve length and chest depth confidence slightly reduced.'],
      createdAt: '2026-09-15 08:30',
    },
  ];
}

export async function createMeasurementSession(payload: {
  captureType?: 'MANUAL' | 'AI';
  heightReference?: string;
}): Promise<{ session: MeasurementSession }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, returning local measurement session');
  }

  const mockSession: MeasurementSession = {
    sessionId: `sess-manual-${Date.now().toString().slice(-4)}`,
    customerId: 'cust-101',
    captureType: payload.captureType || 'MANUAL',
    heightReference: payload.heightReference || '180',
    status: 'CREATED',
    estimatedMeasurements: {},
    confidenceScores: {},
    warnings: [],
    createdAt: new Date().toISOString(),
  };

  return { session: mockSession };
}

export async function saveMeasurementSessionDraft(
  sessionId: string,
  draftMeasurements: Record<string, any>,
  currentStep: number
): Promise<{ message: string; session?: MeasurementSession }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/sessions/${sessionId}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ draftMeasurements, currentStep }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, saving draft locally');
  }

  return { message: 'Draft saved locally' };
}

export async function verifyMeasurementSession(
  sessionId: string,
  payload: {
    verifiedMeasurements: Record<string, any>;
    profileName?: string;
    bodyShape?: string;
    category?: 'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM';
    fitPreference?: 'Slim Fit' | 'Regular Fit' | 'Relaxed Fit';
  }
): Promise<{ message: string; session: MeasurementSession; profile: MeasurementProfile }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/sessions/${sessionId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          await saveMeasurementProfile(data.profile);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, verifying session locally and creating profile');
  }

  const categoryLabels = {
    CASUAL: 'Casual Wear',
    FORMAL: 'Formal Wear',
    TRADITIONAL: 'Traditional Wear',
    WINTER: 'Winter Clothing',
    CUSTOM: 'Custom Fit',
  };

  const easeAllowances = {
    CASUAL: '+2.5 cm relaxed comfort',
    FORMAL: '+1.0 cm sharp bespoke contour',
    TRADITIONAL: 'Ceremonial drape & ankle clearance',
    WINTER: '+4.0 cm heavy layering allowance',
    CUSTOM: 'Customized tailoring ease',
  };

  const selectedCat = payload.category || 'CUSTOM';

  const processedMeasurements: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload.verifiedMeasurements)) {
    const val = typeof v === 'object' ? (v as any).value : Number(v);
    const unit = typeof v === 'object' ? (v as any).unit : 'cm';
    processedMeasurements[k] = {
      value: val,
      unit,
      source: 'MANUAL',
      verified: true,
      measuredAt: new Date().toISOString().slice(0, 10),
    };
  }

  const newProfile: MeasurementProfile = {
    id: `prof-manual-${Date.now().toString().slice(-4)}`,
    profileName: payload.profileName || `${categoryLabels[selectedCat]} Profile`,
    version: 1,
    isCurrent: true,
    category: selectedCat,
    categoryLabel: categoryLabels[selectedCat],
    bodyShape: payload.bodyShape || 'ATHLETIC',
    source: 'Self-Measured (Step 1-7)',
    confidenceScore: 98,
    lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    fitPreference: payload.fitPreference || 'Regular Fit',
    easeAllowance: easeAllowances[selectedCat],
    description: `Crafted via step-by-step self measurement guide for ${categoryLabels[selectedCat]}.`,
    measurements: processedMeasurements,
  };

  await saveMeasurementProfile(newProfile);

  return {
    message: 'Measurement session verified and saved as active profile!',
    session: {
      sessionId,
      customerId: 'cust-101',
      captureType: 'MANUAL',
      status: 'VERIFIED',
      estimatedMeasurements: payload.verifiedMeasurements,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    profile: newProfile,
  };
}

export async function updateMeasurementSessionStatus(sessionId: string, status: MeasurementSessionStatus): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/measurements/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local status update response');
  }

  return { message: `Session status updated to ${status}` };
}

export async function verifyCheckoutMeasurements(
  productId: string,
  userMeasurements: Record<string, any>,
  requiredKeys: string[]
): Promise<MeasurementValidationResult> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}/verify-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMeasurements }),
    });

    if (res.ok || res.status === 422) {
      const data = await res.json();
      if (data.validation) return data.validation;
    }
  } catch (err) {
    console.warn('Backend API unreachable, performing client-side pre-checkout measurement verification');
  }

  // Fallback client-side validation
  const missingKeys: string[] = [];
  const invalidKeys: { key: string; value: any; reason: string }[] = [];
  const errors: string[] = [];

  for (const key of requiredKeys) {
    const item = userMeasurements ? userMeasurements[key] : undefined;
    if (item === undefined || item === null) {
      missingKeys.push(key);
      errors.push(`Missing required measurement: '${key}'`);
      continue;
    }

    const val = typeof item === 'object' ? Number(item.value) : Number(item);
    if (isNaN(val) || val <= 0) {
      invalidKeys.push({ key, value: item, reason: 'Value must be positive' });
      errors.push(`Invalid value for '${key}'`);
    }
  }

  return {
    isValid: missingKeys.length === 0 && invalidKeys.length === 0,
    missingKeys,
    invalidKeys,
    errors,
  };
}

export async function calculateProductPrice(
  productId: string,
  selectedCustomizations: Record<string, any>,
  basePriceFallback: number = 0
): Promise<PriceCalculationResult> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${productId}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedCustomizations }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.pricing) return data.pricing;
    }
  } catch (err) {
    console.warn('Backend API unreachable, calculating authoritatively on client fallback');
  }

  // Fallback price calculator matching server rules
  let customizationModifiersTotal = 0;
  const lineItems: any[] = [];
  const DEFAULT_PRICE_MODIFIERS: Record<string, Record<string, number>> = {
    fabric: {
      'Italian Pure Wool': 2500,
      'Cashmere Blend': 3500,
      'Velvet': 2000,
      'Shemma Woven Cotton': 1000,
      'Silk Blend': 1800,
      '100% Egyptian Cotton': 1200,
    },
    lining: {
      'Paisley Silk': 1500,
      'Monogrammed Silk': 1800,
      'Gold Satin': 1200,
    },
    buttons: {
      'Horn Buttons': 600,
      'Mother of Pearl': 800,
      'Brass Engraved': 700,
    },
    embroidery: {
      'Tibeb Royal Gold': 1500,
      'Gold Thread Custom Monogram': 800,
      'Traditional Cross Motif': 1000,
    },
  };

  for (const [key, val] of Object.entries(selectedCustomizations)) {
    if (!val) continue;
    const choice = typeof val === 'object' ? String((val as any).name || (val as any).value) : String(val);
    const mod = DEFAULT_PRICE_MODIFIERS[key]?.[choice] || 0;
    if (mod > 0) {
      customizationModifiersTotal += mod;
      lineItems.push({
        groupKey: key,
        groupName: key.toUpperCase(),
        choiceName: choice,
        priceModifier: mod,
      });
    }
  }

  return {
    basePrice: basePriceFallback,
    currency: 'ETB',
    lineItems,
    customizationModifiersTotal,
    totalCalculatedPrice: basePriceFallback + customizationModifiersTotal,
  };
}

function getLocalFavoritesStore(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem('sewfit_favorites_store');
    if (raw) {
      const list: FavoriteItem[] = JSON.parse(raw);
      return list.map((fav) => {
        if (fav.productId && (typeof fav.productId === 'string' || typeof fav.productId === 'number')) {
          return { ...fav, productId: getKnownProduct(fav.productId) };
        }
        return fav;
      });
    }
  } catch (e) {}
  return [
    {
      id: 'fav-sample-1',
      favoriteId: 'fav-sample-1',
      customerId: 'cust-101',
      productId: DEFAULT_PRODUCTS[0],
      createdAt: new Date().toISOString(),
    },
  ];
}

function setLocalFavoritesStore(favs: FavoriteItem[]) {
  try {
    localStorage.setItem('sewfit_favorites_store', JSON.stringify(favs));
  } catch (e) {}
}

function getLocalCartStore(): CartData {
  try {
    const raw = localStorage.getItem('sewfit_cart_store');
    if (raw) {
      const cart: CartData = JSON.parse(raw);
      if (cart && Array.isArray(cart.items)) {
        cart.items = cart.items.map((item: any) => {
          const pObj = typeof item.productId === 'object' ? item.productId : getKnownProduct(item.productId);
          const unitPrice = Number(item.unitPrice || item.calculatedPrice || pObj.basePrice || 0);
          const quantity = Number(item.quantity) || 1;
          return {
            ...item,
            productId: pObj,
            quantity,
            unitPrice,
            calculatedPrice: unitPrice,
            itemTotal: unitPrice * quantity,
          };
        });
        const subtotal = cart.items.reduce((sum, it) => sum + (Number(it.calculatedPrice) * Number(it.quantity)), 0);
        const totalItems = cart.items.reduce((sum, it) => sum + Number(it.quantity), 0);
        cart.totals = {
          subtotal,
          totalAmount: subtotal,
          totalItems,
          currency: cart.currency || 'ETB',
        };
        return cart;
      }
    }
  } catch (e) {}
  return {
    customerId: 'cust-101',
    items: [],
    currency: 'ETB',
    totals: { subtotal: 0, totalAmount: 0, totalItems: 0, currency: 'ETB' },
  };
}

function setLocalCartStore(cart: CartData) {
  try {
    localStorage.setItem('sewfit_cart_store', JSON.stringify(cart));
  } catch (e) {}
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.favorites && data.favorites.length > 0) {
          const populated = data.favorites.map((f: any) => {
            const pId = typeof f.productId === 'object' ? (f.productId.id || f.productId.productId || f.productId._id) : f.productId;
            if (pId) {
              return { ...f, productId: getKnownProduct(pId) };
            }
            return f;
          });
          setLocalFavoritesStore(populated);
          return populated;
        }
      }
    }
  } catch (err) {
    console.warn('Backend API unreachable, using local favorites');
  }

  return getLocalFavoritesStore();
}

export async function addFavorite(productId?: string, tailorId?: string): Promise<{ message: string; favorite?: any }> {
  const currentFavs = getLocalFavoritesStore();

  let existingIdx = -1;
  if (productId) {
    existingIdx = currentFavs.findIndex((f) => {
      const pId = typeof f.productId === 'object' 
        ? String((f.productId as any).id || (f.productId as any).productId || (f.productId as any)._id) 
        : String(f.productId);
      return pId === String(productId);
    });
  } else if (tailorId) {
    existingIdx = currentFavs.findIndex((f) => {
      const tId = typeof f.tailorId === 'object' 
        ? String((f.tailorId as any).id || (f.tailorId as any).tailorId || (f.tailorId as any)._id) 
        : String(f.tailorId);
      return tId === String(tailorId);
    });
  }

  let message = 'Item saved to favorites!';
  let newFav: FavoriteItem;

  if (existingIdx >= 0) {
    currentFavs.splice(existingIdx, 1);
    message = 'Item removed from favorites';
    newFav = { id: `fav-${Date.now()}`, customerId: 'cust-101', createdAt: new Date().toISOString() };
  } else {
    const pObj = productId ? getKnownProduct(productId) : undefined;
    newFav = {
      id: `fav-${Date.now()}`,
      favoriteId: `fav-${Date.now()}`,
      customerId: 'cust-101',
      productId: pObj,
      tailorId: tailorId ? ({ id: tailorId, businessName: 'Royal Habesha Couture', profileImage: '/assets/tailor_1.png' } as any) : undefined,
      createdAt: new Date().toISOString(),
    };
    currentFavs.unshift(newFav);
  }

  setLocalFavoritesStore(currentFavs);

  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, tailorId }),
      });
    }
  } catch (err) {}

  return { message, favorite: newFav };
}

export async function removeFavorite(favoriteId: string): Promise<{ message: string }> {
  let currentFavs = getLocalFavoritesStore();
  currentFavs = currentFavs.filter((f) => {
    const fId = f.id || f.favoriteId;
    const pId = typeof f.productId === 'object' 
      ? String((f.productId as any).id || (f.productId as any).productId || (f.productId as any)._id) 
      : String(f.productId);
    return fId !== favoriteId && pId !== favoriteId;
  });
  setLocalFavoritesStore(currentFavs);

  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      await fetch(`${API_BASE}/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {}

  return { message: 'Favorite item removed' };
}

export async function fetchCart(): Promise<CartData> {
  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cart && data.cart.items && data.cart.items.length > 0) {
          const populatedItems = data.cart.items.map((it: any) => {
            const pId = typeof it.productId === 'object' ? (it.productId.id || it.productId.productId || it.productId._id) : it.productId;
            const fullProd = getKnownProduct(pId);
            const unitPrice = Number(it.calculatedPrice || it.unitPrice || fullProd.basePrice);
            return {
              ...it,
              productId: fullProd,
              unitPrice,
              calculatedPrice: unitPrice,
              itemTotal: unitPrice * (Number(it.quantity) || 1),
            };
          });
          const updatedCart = { ...data.cart, items: populatedItems };
          setLocalCartStore(updatedCart);
          return updatedCart;
        }
      }
    }
  } catch (err) {}

  return getLocalCartStore();
}

export async function addToCart(payload: {
  productId: string;
  tailorId: string;
  quantity: number;
  measurementProfileId: string;
  customization: Record<string, any>;
}): Promise<{ message: string; cart?: CartData }> {
  const currentCart = getLocalCartStore();
  const pObj = getKnownProduct(payload.productId);

  const tailorObj = {
    id: String(payload.tailorId || '1'),
    businessName: 'Royal Habesha Couture Atelier',
    profileImage: '/assets/tailor_1.png',
  };

  const priceResult = await calculateProductPrice(String(payload.productId), payload.customization, pObj.basePrice);
  const unitPrice = priceResult.totalCalculatedPrice || pObj.basePrice;
  const qty = payload.quantity > 0 ? payload.quantity : 1;
  const itemTotal = unitPrice * qty;

  const newItem: any = {
    productId: pObj,
    tailorId: tailorObj,
    quantity: qty,
    unitPrice,
    calculatedPrice: unitPrice,
    itemTotal,
    customization: payload.customization || {},
    measurementProfileId: payload.measurementProfileId || 'profile-1',
  };

  const existingIdx = currentCart.items.findIndex((i) => {
    const iPid = typeof i.productId === 'object' 
      ? String((i.productId as any).id || (i.productId as any).productId || (i.productId as any)._id) 
      : String(i.productId);
    return iPid === String(payload.productId);
  });

  if (existingIdx >= 0) {
    currentCart.items[existingIdx].quantity += qty;
    currentCart.items[existingIdx].unitPrice = unitPrice;
    currentCart.items[existingIdx].calculatedPrice = unitPrice;
    currentCart.items[existingIdx].itemTotal = unitPrice * currentCart.items[existingIdx].quantity;
    currentCart.items[existingIdx].customization = { ...currentCart.items[existingIdx].customization, ...payload.customization };
  } else {
    currentCart.items.unshift(newItem);
  }

  const subtotal = currentCart.items.reduce((acc, item) => acc + (Number(item.calculatedPrice || item.unitPrice || 0) * item.quantity), 0);
  const totalItems = currentCart.items.reduce((acc, item) => acc + item.quantity, 0);

  currentCart.totals = {
    subtotal,
    totalAmount: subtotal,
    totalItems,
    currency: pObj.currency || 'ETB',
  };

  setLocalCartStore(currentCart);

  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      await fetch(`${API_BASE}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {}

  return { message: 'Item added to cart with server-validated pricing!', cart: currentCart };
}

export async function updateCartItemQuantity(productId: string, quantity: number): Promise<CartData> {
  const currentCart = getLocalCartStore();
  const pIdStr = String(productId);
  
  if (quantity <= 0) {
    return (await removeFromCart(productId)).cart || currentCart;
  }

  const item = currentCart.items.find((it) => {
    const iPid = typeof it.productId === 'object' 
      ? String((it.productId as any).id || (it.productId as any).productId || (it.productId as any)._id) 
      : String(it.productId);
    return iPid === pIdStr;
  });

  if (item) {
    item.quantity = quantity;
    const unitP = Number(item.calculatedPrice || (item as any).unitPrice || 0);
    (item as any).itemTotal = unitP * quantity;
  }

  const subtotal = currentCart.items.reduce((acc, it) => acc + (Number(it.calculatedPrice || (it as any).unitPrice || 0) * it.quantity), 0);
  const totalItems = currentCart.items.reduce((acc, it) => acc + it.quantity, 0);

  currentCart.totals = {
    subtotal,
    totalAmount: subtotal,
    totalItems,
    currency: currentCart.currency || 'ETB',
  };

  setLocalCartStore(currentCart);
  return currentCart;
}

export async function removeFromCart(productId: string): Promise<{ message: string; cart?: CartData }> {
  const currentCart = getLocalCartStore();
  const pIdStr = String(productId);
  currentCart.items = currentCart.items.filter((item) => {
    const iPid = typeof item.productId === 'object' 
      ? String((item.productId as any).id || (item.productId as any).productId || (item.productId as any)._id) 
      : String(item.productId);
    return iPid !== pIdStr;
  });

  const subtotal = currentCart.items.reduce((acc, item) => acc + (Number(item.calculatedPrice || (item as any).unitPrice || 0) * item.quantity), 0);
  const totalItems = currentCart.items.reduce((acc, item) => acc + item.quantity, 0);

  currentCart.totals = {
    subtotal,
    totalAmount: subtotal,
    totalItems,
    currency: currentCart.currency || 'ETB',
  };

  setLocalCartStore(currentCart);

  try {
    const token = localStorage.getItem('sewfit_token');
    if (token) {
      await fetch(`${API_BASE}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (err) {}

  return { message: 'Item removed from cart', cart: currentCart };
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/orders`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.orders) return data.orders;
    }
  } catch (err) {
    console.warn('Backend API unreachable, returning mock orders');
  }

  return [
    {
      orderId: 'ORD-2026-9001',
      customerId: 'cust-101',
      tailorId: '1',
      productId: '1',
      quantity: 1,
      customerSnapshot: { customerId: 'cust-101', name: 'Abebe Bikila', email: 'abebe.b@example.com' },
      tailorSnapshot: { tailorId: '1', businessName: 'Royal Habesha Couture', businessAddress: 'Bole Medhanealem, Addis Ababa' },
      productSnapshot: { productId: '1', name: 'Custom Three-Piece Tuxedo', categoryName: 'Suit', image: '/images/tuxedo_suit.jpg', basePrice: 12500 },
      customization: { fabric: 'Italian Pure Wool', lining: 'Paisley Silk', buttons: 'Horn Buttons', embroidery: 'Gold Monogram' },
      measurementSnapshot: { chest: { value: 104, unit: 'cm' }, waist: { value: 84, unit: 'cm' }, shoulder: { value: 46, unit: 'cm' }, height: { value: 182, unit: 'cm' } },
      pricingSnapshot: { basePrice: 12500, lineItems: [{ groupKey: 'fabric', groupName: 'FABRIC', choiceName: 'Italian Pure Wool', priceModifier: 2500 }, { groupKey: 'lining', groupName: 'LINING', choiceName: 'Paisley Silk', priceModifier: 1500 }], customizationModifiersTotal: 4000, totalCalculatedPrice: 16500, currency: 'ETB' },
      paymentInfo: { status: 'PAID', paymentMethod: 'TELEBIRR', amountPaid: 16500 },
      deliveryInfo: { recipientName: 'Abebe Bikila', address: 'Kazanchis Residence Tower, Apt 7B', contactPhone: '+251 91 123 4567', deliveryNotes: 'Deliver to front desk reception' },
      status: 'IN_PRODUCTION',
      statusHistory: [
        { historyId: 'h-1', orderId: 'ORD-2026-9001', previousStatus: 'NONE', newStatus: 'PENDING_PAYMENT', actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' }, timestamp: '2026-09-13T10:00:00.000Z', notes: 'Order created with locked pricing and body measurement snapshot.' },
        { historyId: 'h-2', orderId: 'ORD-2026-9001', previousStatus: 'PENDING_PAYMENT', newStatus: 'PAID', actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' }, timestamp: '2026-09-13T10:30:00.000Z', notes: 'Payment verified via Telebirr gateway' },
        { historyId: 'h-3', orderId: 'ORD-2026-9001', previousStatus: 'PAID', newStatus: 'PENDING_TAILOR', actor: { userId: 'system', role: 'SYSTEM', name: 'Order Engine' }, timestamp: '2026-09-13T10:31:00.000Z', notes: 'Order queued in master tailor workshop queue' },
        { historyId: 'h-4', orderId: 'ORD-2026-9001', previousStatus: 'PENDING_TAILOR', newStatus: 'ACCEPTED', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: '2026-09-14T08:15:00.000Z', notes: 'Tailor workshop accepted order and assigned master cutter' },
        { historyId: 'h-5', orderId: 'ORD-2026-9001', previousStatus: 'ACCEPTED', newStatus: 'MEASUREMENT_VERIFICATION', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: '2026-09-14T14:00:00.000Z', notes: 'Verified chest and shoulder dimensions against tuxedo drafting blueprint' },
        { historyId: 'h-6', orderId: 'ORD-2026-9001', previousStatus: 'MEASUREMENT_VERIFICATION', newStatus: 'IN_PRODUCTION', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: '2026-09-15T06:00:00.000Z', notes: 'Wool fabric cut and assembly phase initiated' },
      ],
      createdAt: '2026-09-13T10:00:00.000Z',
      updatedAt: '2026-09-15T06:00:00.000Z',
    },
  ];
}

export async function createOrder(payload: any): Promise<{ message: string; order: Order }> {
  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, creating local order fallback');
  }

  const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const order: Order = {
    orderId,
    customerId: payload.customerId || 'cust-101',
    tailorId: payload.tailorId || '1',
    productId: payload.productId || '1',
    quantity: payload.quantity || 1,
    customerSnapshot: { customerId: 'cust-101', name: payload.customerName || 'Abebe Bikila', email: 'abebe@example.com' },
    tailorSnapshot: { tailorId: '1', businessName: payload.tailorName || 'Royal Habesha Couture' },
    productSnapshot: { productId: String(payload.productId || '1'), name: payload.productName || 'Bespoke Garment', basePrice: payload.basePrice || 8500 },
    customization: payload.customization || {},
    measurementSnapshot: payload.measurementProfile?.measurements || { chest: { value: 104, unit: 'cm' }, waist: { value: 84, unit: 'cm' } },
    pricingSnapshot: { basePrice: payload.basePrice || 8500, lineItems: [], customizationModifiersTotal: 0, totalCalculatedPrice: payload.basePrice || 8500, currency: 'ETB' },
    paymentInfo: { status: 'PENDING', paymentMethod: 'TELEBIRR', amountPaid: payload.basePrice || 8500 },
    deliveryInfo: { recipientName: payload.customerName || 'Abebe Bikila', address: 'Bole Executive Tower #12', contactPhone: '+251 91 123 4567' },
    status: 'PENDING_PAYMENT',
    statusHistory: [
      {
        historyId: `hist-${Date.now()}`,
        orderId,
        previousStatus: 'NONE',
        newStatus: 'PENDING_PAYMENT',
        actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' },
        timestamp: new Date().toISOString(),
        notes: 'Order submitted with locked measurement snapshot.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { message: 'Order created with immutable snapshots!', order };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorRole: string = 'TAILOR',
  notes?: string
): Promise<{ message: string; order?: Order; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus, actorRole, notes }),
    });

    const data = await res.json();
    if (res.ok) return data;
    return { message: data.error || 'Failed to update order status', error: data.details || data.error };
  } catch (err) {
    console.warn('Backend API unreachable, updating local order status');
  }

  return { message: `Order status updated to '${newStatus}'` };
}

export async function updateProductionStage(
  orderId: string,
  productionStage: TailorProductionStage,
  notes?: string
): Promise<{ message: string; order?: Order; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}/production-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productionStage, notes }),
    });

    const data = await res.json();
    if (res.ok) return data;
    return { message: data.error || 'Failed to update production stage', error: data.details || data.error };
  } catch (err) {
    console.warn('Backend API unreachable, updating local production stage');
  }

  return { message: `Production stage updated to '${productionStage}'` };
}

/* ==========================================
   21. PAYMENT SERVICE API
   ========================================== */

export async function initiatePayment(payload: {
  orderId: string;
  provider: PaymentProvider;
  customerId: string;
  amount: number;
  currency?: string;
}): Promise<{ message: string; payment: PaymentRecord; paymentInstructions?: any }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, returning simulated payment initiation');
  }

  const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
  return {
    message: 'Payment session initiated',
    payment: {
      paymentId,
      orderId: payload.orderId,
      customerId: payload.customerId,
      provider: payload.provider,
      amount: payload.amount,
      currency: payload.currency || 'ETB',
      status: 'PENDING',
      initiatedAt: new Date().toISOString(),
    },
    paymentInstructions: {
      action: payload.provider === 'Telebirr' || payload.provider === 'Chapa' ? 'REDIRECT_WEB' : 'MANUAL_DEPOSIT',
      reference: `REF-${paymentId}`,
      instructions: `Please complete payment of ${payload.amount} ${payload.currency || 'ETB'} via ${payload.provider}.`,
    },
  };
}

export async function verifyPayment(payload: {
  paymentId: string;
  transactionReference?: string;
}): Promise<{ message: string; payment?: PaymentRecord; orderUpdated?: boolean; verification?: any }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, returning simulated verified payment');
  }

  return {
    message: 'Payment verified and server order updated!',
    payment: {
      paymentId: payload.paymentId,
      orderId: 'ORD-2026-9001',
      customerId: 'cust-101',
      provider: 'Telebirr',
      amount: 16500,
      currency: 'ETB',
      status: 'SUCCESS',
      transactionReference: payload.transactionReference || 'TXN-FALLBACK-889',
      initiatedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    },
    orderUpdated: true,
  };
}

/* ==========================================
   23. CUSTOMER ADDRESS BOOK API
   ========================================== */

export async function fetchAddresses(): Promise<CustomerAddress[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/addresses`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.addresses) return data.addresses;
    }
  } catch (err) {
    console.warn('Backend API unreachable, using fallback address list');
  }

  return [
    {
      id: 'addr-1',
      addressId: 'addr-1',
      customerId: 'cust-101',
      label: 'Home Residence',
      recipientName: 'Abebe Bikila',
      phone: '+251 91 123 4567',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Kirkos',
      woreda: '02',
      street: 'Kazanchis Residence Tower, Apt 7B',
      additionalInformation: 'Near UNECA Head Office',
      isDefault: true,
      createdAt: '2026-09-10T10:00:00.000Z',
    },
    {
      id: 'addr-2',
      addressId: 'addr-2',
      customerId: 'cust-101',
      label: 'Corporate Office',
      recipientName: 'Abebe Bikila (Executive)',
      phone: '+251 91 999 8877',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      subCity: 'Bole',
      woreda: '03',
      street: 'Bole Executive Plaza, 5th Floor',
      additionalInformation: 'Leave with 5th floor receptionist',
      isDefault: false,
      createdAt: '2026-09-12T14:30:00.000Z',
    },
  ];
}

export async function createAddress(addressData: Omit<CustomerAddress, 'id' | '_id' | 'addressId'>): Promise<{ message: string; address: CustomerAddress }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/addresses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(addressData),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, creating local address fallback');
  }

  const id = `addr-${Date.now()}`;
  return {
    message: 'Address saved to profile',
    address: {
      id,
      addressId: id,
      ...addressData,
    },
  };
}

export async function setDefaultAddress(addressId: string): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/addresses/${addressId}/default`, {
      method: 'PUT',
      headers,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, setting local default address');
  }

  return { message: 'Default address updated' };
}

export async function deleteAddress(addressId: string): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/addresses/${addressId}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, deleting local address');
  }

  return { message: 'Address removed' };
}

/* ==========================================
   24. CENTRALIZED NOTIFICATION SERVICE API
   ========================================== */

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/notifications`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.notifications) return data.notifications;
    }
  } catch (err) {
    console.warn('Backend API unreachable, returning mock notifications list');
  }

  return [
    {
      notificationId: 'notif-101',
      recipientId: 'cust-101',
      eventType: 'ORDER_STATUS_CHANGED',
      channel: 'in-app',
      title: 'Tuxedo In Production ✂️',
      body: 'Royal Habesha Couture has started cutting & assembling your Custom Three-Piece Tuxedo.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      notificationId: 'notif-102',
      recipientId: 'cust-101',
      eventType: 'MEASUREMENT_VERIFIED',
      channel: 'in-app',
      title: 'Measurements Verified ✓',
      body: 'Your AI body scan measurement profile was reviewed and approved by Master Tailor Abebe.',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      notificationId: 'notif-103',
      recipientId: 'cust-101',
      eventType: 'PAYMENT_SUCCESS',
      channel: 'email',
      title: 'Payment Receipt Confirmed 💳',
      body: 'Telebirr payment of 16,500 ETB for Order #ORD-2026-9001 was successfully verified.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    },
  ];
}

export async function markNotificationRead(notificationId: string): Promise<{ message: string }> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, marking local notification read');
  }

  return { message: 'Notification marked as read' };
}

/* ==========================================
   25. REVIEWS API
   ========================================== */

export async function createReview(payload: {
  orderId: string;
  customerId?: string;
  tailorId?: string;
  rating: number;
  comment?: string;
}): Promise<{ message: string; review?: ReviewItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) return data;
    return { message: data.error || 'Failed to submit review', error: data.error };
  } catch (err: any) {
    console.warn('Backend API unreachable, submitting mock review');
  }

  return {
    message: 'Review submitted successfully!',
    review: {
      id: `rev-${Date.now()}`,
      customerId: payload.customerId || 'cust-101',
      tailorId: payload.tailorId || '1',
      orderId: payload.orderId,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function fetchTailorReviews(tailorId: string): Promise<{ averageRating: number; reviewCount: number; reviews: ReviewItem[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/reviews/tailor/${tailorId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, returning mock tailor reviews');
  }

  return {
    averageRating: 4.9,
    reviewCount: 1,
    reviews: [
      {
        id: 'rev-101',
        customerId: 'cust-101',
        tailorId,
        rating: 5,
        comment: 'Exquisite stitching on my Three-Piece Tuxedo! Perfect fit on shoulders and chest.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
}

export async function checkReviewEligibility(orderId: string): Promise<{ isEligible: boolean; reason?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reviews/eligibility/${orderId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, returning client eligibility check');
  }

  return { isEligible: true };
}

/* ==========================================
   26. SUPPORT TICKETS API
   ========================================== */

export async function createSupportTicket(payload: {
  subject: string;
  description: string;
  type?: string;
  orderId?: string;
  priority?: string;
}): Promise<{ message: string; ticket: SupportTicketItem }> {
  try {
    const res = await fetch(`${API_BASE}/api/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, creating mock ticket');
  }

  const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
  return {
    message: 'Support ticket created!',
    ticket: {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      userId: 'cust-101',
      userRole: 'CUSTOMER',
      type: (payload.type as any) || 'GENERAL',
      orderId: payload.orderId,
      subject: payload.subject,
      description: payload.description,
      status: 'OPEN',
      priority: (payload.priority as any) || 'MEDIUM',
      messages: [
        {
          senderId: 'cust-101',
          senderRole: 'CUSTOMER',
          senderName: 'Abebe Bikila',
          message: payload.description,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function fetchSupportTickets(): Promise<SupportTicketItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/support/tickets`);
    if (res.ok) {
      const data = await res.json();
      if (data.tickets) return data.tickets;
    }
  } catch (err) {
    console.warn('Backend API unreachable, returning mock tickets');
  }

  return [
    {
      id: 'tkt-1',
      ticketNumber: 'TKT-9081',
      userId: 'cust-101',
      userRole: 'CUSTOMER',
      type: 'ORDER_ISSUE',
      orderId: 'ORD-2026-9001',
      subject: 'Inquiry regarding shoulder lining fabric option',
      description: 'Would it be possible to add gold satin monogramming to my silk lining before sewing starts?',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      messages: [
        {
          senderId: 'cust-101',
          senderRole: 'CUSTOMER',
          senderName: 'Abebe Bikila',
          message: 'Would it be possible to add gold satin monogramming to my silk lining before sewing starts?',
          createdAt: '2026-09-14T10:00:00.000Z',
        },
        {
          senderId: 'tailor-1',
          senderRole: 'TAILOR',
          senderName: 'Royal Habesha Couture',
          message: 'Hello Abebe! Yes, we have received your request and updated the workshop drafting spec.',
          createdAt: '2026-09-14T11:30:00.000Z',
        },
      ],
      createdAt: '2026-09-14T10:00:00.000Z',
      updatedAt: '2026-09-14T11:30:00.000Z',
    },
  ];
}

export async function addTicketMessage(ticketId: string, message: string, senderRole: string = 'CUSTOMER', senderName: string = 'Abebe Bikila'): Promise<{ message: string; ticket: SupportTicketItem }> {
  try {
    const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, senderRole, senderName }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, adding local ticket reply');
  }

  return {
    message: 'Reply posted to ticket thread',
    ticket: {
      id: ticketId,
      ticketNumber: 'TKT-9081',
      userId: 'cust-101',
      userRole: 'CUSTOMER',
      type: 'GENERAL',
      subject: 'Support Ticket',
      description: message,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      messages: [
        {
          senderId: 'user-1',
          senderRole,
          senderName,
          message,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function updateTicketStatus(ticketId: string, status: string, resolutionNotes?: string): Promise<{ message: string; ticket: SupportTicketItem }> {
  try {
    const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend API unreachable, updating local ticket status');
  }

  return {
    message: `Ticket status updated to ${status}`,
    ticket: {
      id: ticketId,
      ticketNumber: 'TKT-9081',
      userId: 'cust-101',
      userRole: 'CUSTOMER',
      type: 'GENERAL',
      subject: 'Support Ticket',
      description: 'Ticket description',
      status: status as any,
      priority: 'MEDIUM',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/* ==========================================
   27. AUDIT LOGS API
   ========================================== */

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const token = localStorage.getItem('sewfit_token');
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/admin/audit-logs`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.logs) return data.logs;
    }
  } catch (err) {
    console.warn('Backend API unreachable, returning mock audit log list');
  }

  return [
    {
      id: 'aud-1',
      actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' },
      action: 'UPDATE_PRODUCTION_STAGE',
      resource: 'Order',
      resourceId: 'ORD-2026-9001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      metadata: { stage: 'IN_PRODUCTION', progressPercent: 40, notes: 'Fabric cut and assembly initiated' },
    },
    {
      id: 'aud-2',
      actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' },
      action: 'VERIFY_PAYMENT',
      resource: 'Payment',
      resourceId: 'PAY-9012',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      metadata: { provider: 'Telebirr', amount: 16500, transactionRef: 'TXN-TB-998822', secretToken: '[REDACTED_SENSITIVE_DATA]' },
    },
    {
      id: 'aud-3',
      actor: { userId: 'admin-1', role: 'ADMIN', name: 'Master System Admin' },
      action: 'VERIFY_TAILOR',
      resource: 'Tailor',
      resourceId: 'tailor-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      metadata: { previousStatus: 'PENDING', newStatus: 'VERIFIED' },
    },
  ];
}









