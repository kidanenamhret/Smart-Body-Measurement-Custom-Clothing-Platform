import { Schema, model, Document, Types } from 'mongoose';

export interface IDeliveryAgent extends Document {
  userId: Types.ObjectId; // ref to User
  phone?: string;
  vehicleType?: string; // Motorcycle, Bicycle, Car, Van
  licensePlate?: string;
  status: 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  completedDeliveriesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryAgentSchema = new Schema<IDeliveryAgent>(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String },
    vehicleType: { type: String, default: 'Motorcycle' },
    licensePlate: { type: String },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_DELIVERY', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true,
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      lastUpdated: { type: Date },
    },
    completedDeliveriesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DeliveryAgent = model<IDeliveryAgent>('DeliveryAgent', DeliveryAgentSchema);
