import { Schema, model, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  favoriteId?: string;
  customerId: Types.ObjectId;
  productId?: Types.ObjectId; // either clothing product or tailor
  tailorId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'ClothingProduct' },
    tailorId: { type: Schema.Types.ObjectId, ref: 'Tailor' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

FavoriteSchema.virtual('favoriteId').get(function (this: IFavorite) {
  return (this._id as any)?.toString();
});

// Ensure a customer cannot favorite the same entity twice
FavoriteSchema.index({ customerId: 1, productId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ customerId: 1, tailorId: 1 }, { unique: true, sparse: true });

export const Favorite = model<IFavorite>('Favorite', FavoriteSchema);

