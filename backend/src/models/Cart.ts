import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  tailorId: Types.ObjectId;
  quantity: number;
  measurementProfileId: Types.ObjectId;
  customization: Record<string, any>;
  calculatedPrice: number;
}

export interface ICartTotals {
  subtotal: number;
  totalAmount: number;
  totalItems: number;
  currency: string;
}

export interface ICart extends Document {
  customerId: Types.ObjectId;
  items: ICartItem[];
  currency: string;
  totals?: ICartTotals;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'ClothingProduct', required: true },
    tailorId: { type: Schema.Types.ObjectId, ref: 'Tailor', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    measurementProfileId: { type: Schema.Types.ObjectId, ref: 'BodyMeasurementProfile', required: true },
    customization: { type: Schema.Types.Mixed },
    calculatedPrice: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    items: [CartItemSchema],
    currency: { type: String, required: true, default: 'ETB' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for cart totals calculation
CartSchema.virtual('totals').get(function (this: ICart): ICartTotals {
  let subtotal = 0;
  let totalItems = 0;

  if (this.items && Array.isArray(this.items)) {
    for (const item of this.items) {
      const q = Number(item.quantity) || 1;
      const price = Number(item.calculatedPrice) || 0;
      subtotal += price * q;
      totalItems += q;
    }
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalAmount: Math.round(subtotal * 100) / 100,
    totalItems,
    currency: this.currency || 'ETB',
  };
});

export const Cart = model<ICart>('Cart', CartSchema);

