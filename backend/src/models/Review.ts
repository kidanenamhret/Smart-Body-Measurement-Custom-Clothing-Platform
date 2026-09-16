import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  customerId: Types.ObjectId;
  tailorId: Types.ObjectId;
  orderId?: Types.ObjectId;
  productId?: Types.ObjectId;
  rating: number; // 1 - 5
  comment?: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerId: { type: Types.ObjectId, ref: 'Customer', required: true, index: true },
    tailorId: { type: Types.ObjectId, ref: 'Tailor', required: true, index: true },
    orderId: { type: Types.ObjectId, ref: 'Order', unique: true, sparse: true, index: true },
    productId: { type: Types.ObjectId, ref: 'ClothingProduct' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    photos: [{ type: String }],
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', ReviewSchema);
