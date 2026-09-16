import { Schema, model, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  complaintId: string;
  customerId: Types.ObjectId;
  orderId?: Types.ObjectId;
  tailorId?: Types.ObjectId;
  category: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    customerId: { type: Types.ObjectId, ref: 'Customer', required: true, index: true },
    orderId: { type: Types.ObjectId, ref: 'Order' },
    tailorId: { type: Types.ObjectId, ref: 'Tailor' },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    resolution: { type: String },
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
