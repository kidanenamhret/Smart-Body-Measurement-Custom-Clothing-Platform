import { Schema, model, Document, Types } from 'mongoose';

export interface ITicketMessage {
  senderId: Types.ObjectId;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: Types.ObjectId; // ref to User
  userRole: 'CUSTOMER' | 'TAILOR' | 'DELIVERY_AGENT' | 'ADMIN';
  type: 'COMPLAINT' | 'ORDER_ISSUE' | 'PAYMENT_ISSUE' | 'GENERAL' | 'DISPUTE';
  orderId?: Types.ObjectId;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  resolutionNotes?: string;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: {
      type: String,
      enum: ['CUSTOMER', 'TAILOR', 'DELIVERY_AGENT', 'ADMIN'],
      required: true,
    },
    type: {
      type: String,
      enum: ['COMPLAINT', 'ORDER_ISSUE', 'PAYMENT_ISSUE', 'GENERAL', 'DISPUTE'],
      default: 'GENERAL',
    },
    orderId: { type: Types.ObjectId, ref: 'Order' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    resolutionNotes: { type: String },
    messages: [
      {
        senderId: { type: Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SupportTicket = model<ISupportTicket>('SupportTicket', SupportTicketSchema);
