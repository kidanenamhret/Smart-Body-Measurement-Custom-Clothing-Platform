import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
  tailorId: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Types.ObjectId, ref: 'Order', required: true, index: true },
    customerId: { type: Types.ObjectId, ref: 'Customer', required: true, index: true },
    tailorId: { type: Types.ObjectId, ref: 'Tailor', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB' },
    paymentMethod: {
      type: String,
      default: 'TELEBIRR',
    },
    transactionReference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paidAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
