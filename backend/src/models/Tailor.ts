import { Schema, model, Document, Types } from 'mongoose';

export interface ITailor extends Document {
  userId: Types.ObjectId; // ref to User
  businessName: string;
  description?: string;
  phone?: string;
  businessAddress?: string;
  location?: {
    lat: number;
    lng: number;
  };
  profileImage?: string;
  businessImages?: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  verificationDocuments?: string[];
  services?: string[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TailorSchema = new Schema<ITailor>(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true },
    description: { type: String },
    phone: { type: String },
    businessAddress: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    profileImage: { type: String },
    businessImages: [{ type: String }],
    verificationDocuments: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    services: [{ type: String }],
    averageRating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Tailor = model<ITailor>('Tailor', TailorSchema);
