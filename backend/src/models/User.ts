import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  TAILOR = 'TAILOR',
  DELIVERY_AGENT = 'DELIVERY_AGENT',
  ADMIN = 'ADMIN',
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  emailVerificationToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerificationToken: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
