import { Schema, model, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  customerId: Types.ObjectId | string;
  label: 'HOME' | 'WORK' | 'WORKSHOP' | 'OTHER';
  recipientName: string;
  phone: string;
  region: string;
  city: string;
  subCity?: string;
  woreda?: string;
  street?: string;
  additionalInformation?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    customerId: { type: Schema.Types.Mixed, required: true, index: true },
    label: { type: String, enum: ['HOME', 'WORK', 'WORKSHOP', 'OTHER'], default: 'HOME' },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    region: { type: String, required: true, default: 'Addis Ababa' },
    city: { type: String, required: true, default: 'Addis Ababa' },
    subCity: { type: String },
    woreda: { type: String },
    street: { type: String },
    additionalInformation: { type: String },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

export const Address = model<IAddress>('Address', AddressSchema);
