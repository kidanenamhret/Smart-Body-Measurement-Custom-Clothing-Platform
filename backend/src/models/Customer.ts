import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  userId: Types.ObjectId; // ref to User
  profileImage?: string;
  dateOfBirth?: Date;
  preferences?: Record<string, any>;
  defaultMeasurementProfileId?: Types.ObjectId;
  defaultAddressId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    preferences: { type: Schema.Types.Mixed },
    defaultMeasurementProfileId: { type: Types.ObjectId, ref: 'BodyMeasurementProfile' },
    defaultAddressId: { type: Types.ObjectId, ref: 'Address' },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>('Customer', CustomerSchema);
