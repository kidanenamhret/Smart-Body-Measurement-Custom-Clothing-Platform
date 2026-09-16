import { Schema, model, Document } from 'mongoose';

export interface IClothingCategory extends Document {
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  requiredMeasurements: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const INITIAL_CATEGORIES = [
  {
    name: 'Shirt',
    slug: 'shirt',
    description: 'Tailored formal, casual, and Oxford dress shirts',
    requiredMeasurements: ['neck', 'shoulder', 'chest', 'waist', 'sleeveLength', 'bicep', 'wrist', 'shirtLength'],
  },
  {
    name: 'T-Shirt',
    slug: 't-shirt',
    description: 'Custom fitted polo shirts, tees, and henleys',
    requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeveLength', 'shirtLength'],
  },
  {
    name: 'Trouser',
    slug: 'trouser',
    description: 'Bespoke dress pants, chinos, and tailored trousers',
    requiredMeasurements: ['waist', 'hip', 'thigh', 'knee', 'calf', 'inseam', 'outseam', 'rise'],
  },
  {
    name: 'Suit',
    slug: 'suit',
    description: 'Handcrafted two-piece & three-piece suits and tuxedos',
    requiredMeasurements: [
      'neck',
      'shoulder',
      'chest',
      'waist',
      'hip',
      'backWidth',
      'sleeveLength',
      'bicep',
      'wrist',
      'jacketLength',
      'thigh',
      'knee',
      'calf',
      'inseam',
      'outseam',
      'rise',
    ],
  },
  {
    name: 'Jacket',
    slug: 'jacket',
    description: 'Custom blazers, coats, waistcoats, and outerwear',
    requiredMeasurements: ['neck', 'shoulder', 'chest', 'waist', 'backWidth', 'sleeveLength', 'jacketLength'],
  },
  {
    name: 'Dress',
    slug: 'dress',
    description: 'Bespoke evening gowns, cocktail dresses, and bridal attire',
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height'],
  },
  {
    name: 'Traditional Clothing',
    slug: 'traditional-clothing',
    description: 'Authentic Habesha Kemis, Kaba, and cultural ceremonial garments',
    requiredMeasurements: ['chest', 'waist', 'hip', 'shoulder', 'height', 'sleeveLength'],
  },
  {
    name: 'Other Custom Garment',
    slug: 'other-custom-garment',
    description: 'Specialized uniforms, vestments, and custom pattern creations',
    requiredMeasurements: ['chest', 'waist', 'height'],
  },
];

const ClothingCategorySchema = new Schema<IClothingCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String },
    image: { type: String },
    requiredMeasurements: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ClothingCategorySchema.virtual('categoryId').get(function (this: IClothingCategory) {
  return (this._id as any)?.toString();
});

export const ClothingCategory = model<IClothingCategory>('ClothingCategory', ClothingCategorySchema);

/**
 * Seed initial database categories if none exist.
 */
export async function seedInitialCategories(): Promise<void> {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;
    const count = await ClothingCategory.countDocuments();
    if (count === 0) {
      await ClothingCategory.insertMany(INITIAL_CATEGORIES);
      console.log('✅ Initial database clothing categories seeded successfully.');
    }
  } catch (err: any) {
    console.warn('⚠️ Category seeding notice:', err.message);
  }
}
