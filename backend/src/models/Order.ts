import { Schema, model, Document, Types } from 'mongoose';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PENDING_TAILOR'
  | 'ACCEPTED'
  | 'MEASUREMENT_VERIFICATION'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  // Legacy aliases
  | 'PENDING_ACCEPTANCE'
  | 'READY_FOR_DELIVERY'
  | 'MEASUREMENTS_VERIFIED'
  | 'COMPLETED';

export type TailorProductionStage =
  | 'ORDER_ACCEPTED'
  | 'MEASUREMENT_VERIFIED'
  | 'CUTTING'
  | 'SEWING'
  | 'FINISHING'
  | 'QUALITY_CHECK'
  | 'READY';

export interface IOrderHistoryRecord {
  historyId?: string;
  orderId?: string;
  previousStatus?: OrderStatus | string;
  newStatus?: OrderStatus | string;
  actor?: {
    userId: string;
    role: string;
    name: string;
  };
  timestamp?: Date;
  notes?: string;
  // Legacy compatibility fields
  status?: string;
  changedAt?: Date;
  note?: string;
}

export interface IOrderProductSnapshot {
  productId: string;
  name: string;
  categoryName?: string;
  image?: string;
  basePrice: number;
}

export interface IOrderTailorSnapshot {
  tailorId: string;
  businessName: string;
  businessAddress?: string;
}

export interface IOrderCustomerSnapshot {
  customerId: string;
  name: string;
  email: string;
}

export interface IOrderPricingSnapshot {
  basePrice: number;
  lineItems: Array<{
    groupName: string;
    choiceName: string;
    priceModifier: number;
  }>;
  customizationModifiersTotal: number;
  totalCalculatedPrice: number;
  currency: string;
}

export interface IOrderPaymentInfo {
  status: 'PENDING' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED';
  paymentMethod: string;
  paymentReference?: string;
  amountPaid: number;
}

export interface IOrderDeliveryInfo {
  recipientName: string;
  address: string;
  contactPhone: string;
  deliveryNotes?: string;
}

export interface IOrderItem {
  productId: Types.ObjectId | string;
  tailorId: Types.ObjectId | string;
  quantity: number;
  measurementSnapshot: Record<string, any>;
  customization: Record<string, any>;
  priceSnapshot: number;
}

export interface IOrder extends Document {
  orderId: string;
  customerId: Types.ObjectId | string;
  tailorId: Types.ObjectId | string;
  productId?: Types.ObjectId | string;
  customerSnapshot?: IOrderCustomerSnapshot;
  tailorSnapshot?: IOrderTailorSnapshot;
  productSnapshot?: IOrderProductSnapshot;
  customization?: Record<string, any>;
  measurementSnapshot?: Record<string, any>;
  pricingSnapshot?: IOrderPricingSnapshot;
  paymentInfo?: IOrderPaymentInfo;
  deliveryInfo?: IOrderDeliveryInfo;
  quantity?: number;
  status: OrderStatus;
  productionStage?: TailorProductionStage;
  productionProgressPercent?: number;
  productionNotes?: string;
  statusHistory: IOrderHistoryRecord[];
  createdAt: Date;
  updatedAt: Date;

  // Legacy fields for backward compatibility
  items?: IOrderItem[];
  totalAmount?: number;
  currency?: string;
  measurementProfileId?: Types.ObjectId | string;
  measurementVerified?: boolean;
  measurementVerifiedAt?: Date;
  productionStatus?: string;
  qualityChecked?: boolean;
  qualityCheckNotes?: string;
  qualityCheckedAt?: Date;
  rejectionReason?: string;
  readyAt?: Date;
  paymentId?: Types.ObjectId | string;
  deliveryId?: Types.ObjectId | string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.Mixed, required: true },
    tailorId: { type: Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true, min: 1 },
    measurementSnapshot: { type: Schema.Types.Mixed, required: true },
    customization: { type: Schema.Types.Mixed },
    priceSnapshot: { type: Number, required: true },
  },
  { _id: false }
);

const OrderHistorySchema = new Schema<IOrderHistoryRecord>(
  {
    historyId: { type: String },
    orderId: { type: String },
    previousStatus: { type: String },
    newStatus: { type: String },
    actor: {
      userId: { type: String },
      role: { type: String },
      name: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
    // Legacy fields
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, default: () => `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`, index: true },
    customerId: { type: Schema.Types.Mixed, required: true, index: true },
    tailorId: { type: Schema.Types.Mixed, required: true, index: true },
    productId: { type: Schema.Types.Mixed },
    customerSnapshot: { type: Schema.Types.Mixed },
    tailorSnapshot: { type: Schema.Types.Mixed },
    productSnapshot: { type: Schema.Types.Mixed },
    customization: { type: Schema.Types.Mixed, default: {} },
    measurementSnapshot: { type: Schema.Types.Mixed },
    pricingSnapshot: { type: Schema.Types.Mixed },
    paymentInfo: { type: Schema.Types.Mixed },
    deliveryInfo: { type: Schema.Types.Mixed },
    quantity: { type: Number, default: 1 },
    status: {
      type: String,
      required: true,
      default: 'PENDING_PAYMENT',
      index: true,
    },
    productionStage: { type: String },
    productionProgressPercent: { type: Number, default: 0 },
    productionNotes: { type: String },
    statusHistory: [OrderHistorySchema],

    // Legacy fields
    items: [OrderItemSchema],
    totalAmount: { type: Number },
    currency: { type: String, default: 'ETB' },
    measurementProfileId: { type: Schema.Types.Mixed },
    measurementVerified: { type: Boolean, default: false },
    measurementVerifiedAt: { type: Date },
    productionStatus: { type: String },
    qualityChecked: { type: Boolean, default: false },
    qualityCheckNotes: { type: String },
    qualityCheckedAt: { type: Date },
    rejectionReason: { type: String },
    readyAt: { type: Date },
    paymentId: { type: Schema.Types.Mixed },
    deliveryId: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', OrderSchema);
