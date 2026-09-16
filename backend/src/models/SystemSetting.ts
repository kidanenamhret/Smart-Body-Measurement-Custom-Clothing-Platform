import { Schema, model, Document, Types } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: any;
  description: string;
  category: 'GENERAL' | 'FINANCIAL' | 'DELIVERY' | 'MAINTENANCE';
  updatedBy?: Types.ObjectId; // ref to User (admin)
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['GENERAL', 'FINANCIAL', 'DELIVERY', 'MAINTENANCE'],
      default: 'GENERAL',
    },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemSetting = model<ISystemSetting>('SystemSetting', SystemSettingSchema);
