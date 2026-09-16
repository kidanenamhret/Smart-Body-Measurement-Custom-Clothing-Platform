import { Schema, model, Document, Types } from 'mongoose';

export type ProductAvailabilityStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface IClothingProduct extends Document {
  productId?: string;
  tailorId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  images: string[];
  basePrice: number;
  currency: string; // e.g., "ETB"
  availableSizes?: string[];
  fabricOptions?: string[];
  colorOptions?: string[];
  customizationOptions?: Record<string, any>;
  requiredMeasurements: string[]; // measurement keys like "chest", "waist"
  productionTimeDays?: number;
  productionTime?: string;
  availabilityStatus: ProductAvailabilityStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ClothingProductSchema = new Schema<IClothingProduct>(
  {
    tailorId: { type: Schema.Types.ObjectId, ref: 'Tailor', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ClothingCategory', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    basePrice: { type: Number, required: true },
    currency: { type: String, required: true, default: 'ETB' },
    availableSizes: [{ type: String }],
    fabricOptions: [{ type: String }],
    colorOptions: [{ type: String }],
    customizationOptions: { type: Schema.Types.Mixed },
    requiredMeasurements: [{ type: String, required: true }],
    productionTimeDays: { type: Number, default: 7 },
    availabilityStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ClothingProductSchema.virtual('productId').get(function (this: IClothingProduct) {
  return (this._id as any)?.toString();
});

ClothingProductSchema.virtual('productionTime')
  .get(function (this: IClothingProduct) {
    return this.productionTimeDays ? `${this.productionTimeDays} days` : '7 days';
  })
  .set(function (this: IClothingProduct, val: any) {
    if (typeof val === 'number') {
      this.productionTimeDays = val;
    } else if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) this.productionTimeDays = parsed;
    }
  });

export const ClothingProduct = model<IClothingProduct>('ClothingProduct', ClothingProductSchema);

