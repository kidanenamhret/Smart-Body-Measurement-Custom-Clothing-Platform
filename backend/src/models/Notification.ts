import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId; // ref to User
  recipientRole: 'CUSTOMER' | 'TAILOR' | 'DELIVERY_AGENT' | 'ADMIN';
  title: string;
  message: string;
  type: string; // e.g. "NEW_ORDER", "STATUS_UPDATE", "REVIEW_RECEIVED"
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: {
      type: String,
      enum: ['CUSTOMER', 'TAILOR', 'DELIVERY_AGENT', 'ADMIN'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, default: 'INFO' },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
