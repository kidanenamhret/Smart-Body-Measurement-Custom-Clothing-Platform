import { Schema, model, Document, Types } from 'mongoose';

export type DeliveryStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE_TO_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'EN_ROUTE_TO_CUSTOMER'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface IDeliveryTrackingUpdate {
  status: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  note?: string;
}

export interface IDelivery extends Document {
  orderId: Types.ObjectId | string;
  deliveryAgentId?: Types.ObjectId | string;
  tailorId?: Types.ObjectId | string;
  customerId?: Types.ObjectId | string;
  pickupInfo: {
    businessName: string;
    address: string;
    contactPhone: string;
    location?: {
      lat: number;
      lng: number;
    };
    notes?: string;
  };
  deliveryInfo: {
    recipientName: string;
    address: string;
    contactPhone: string;
    location?: {
      lat: number;
      lng: number;
    };
    notes?: string;
  };
  status: DeliveryStatus;
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  pickupConfirmedAt?: Date;
  deliveryConfirmedAt?: Date;
  proofOfDelivery?: {
    recipientName?: string;
    notes?: string;
    photoUrl?: string;
    signatureUrl?: string;
  };
  notes?: string;
  trackingHistory: IDeliveryTrackingUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: Schema.Types.Mixed, required: true, index: true },
    deliveryAgentId: { type: Schema.Types.Mixed, index: true },
    tailorId: { type: Schema.Types.Mixed },
    customerId: { type: Schema.Types.Mixed },
    pickupInfo: {
      businessName: { type: String, required: true },
      address: { type: String, required: true },
      contactPhone: { type: String, required: true },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      notes: { type: String },
    },
    deliveryInfo: {
      recipientName: { type: String, required: true },
      address: { type: String, required: true },
      contactPhone: { type: String, required: true },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      notes: { type: String },
    },
    status: {
      type: String,
      default: 'PENDING',
      index: true,
    },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    pickupConfirmedAt: { type: Date },
    deliveryConfirmedAt: { type: Date },
    proofOfDelivery: {
      recipientName: { type: String },
      notes: { type: String },
      photoUrl: { type: String },
      signatureUrl: { type: String },
    },
    notes: { type: String },
    trackingHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: {
          lat: { type: Number },
          lng: { type: Number },
        },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Delivery = model<IDelivery>('Delivery', DeliverySchema);
