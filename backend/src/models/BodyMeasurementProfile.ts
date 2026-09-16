import { Schema, model, Document, Types } from 'mongoose';

export interface IMeasurementValue {
  value: number;
  unit: string; // "cm" (internal standard) or "kg" for weight
  source: 'MANUAL' | 'AI' | 'TAILOR' | 'IMPORTED';
  confidence?: number; // 0‑1 range for AI
  verified: boolean;
  measuredAt: Date;
  notes?: string;
}

export interface IBodyMeasurementProfile extends Document {
  customerId: Types.ObjectId; // ref to Customer
  profileName: string; // e.g. "Primary Fit", "Suit Profile", "Summer 2026"
  version: number; // 1, 2, 3...
  isCurrent: boolean; // flag for currently selected profile
  source: 'MANUAL' | 'AI' | 'TAILOR' | 'IMPORTED';
  bodyShape?: string; // RECTANGLE, HOURGLASS, INVERTED_TRIANGLE, PEAR, OVAL, ATHLETIC
  status: 'ACTIVE' | 'ARCHIVED';
  measurements: Record<string, IMeasurementValue>;
  createdAt: Date;
  updatedAt: Date;
}

const MeasurementValueSchema = new Schema<IMeasurementValue>(
  {
    value: { type: Number, required: true },
    unit: { type: String, required: true, default: 'cm' },
    source: {
      type: String,
      required: true,
      enum: ['MANUAL', 'AI', 'TAILOR', 'IMPORTED'],
      default: 'MANUAL',
    },
    confidence: { type: Number, min: 0, max: 1, default: 1.0 },
    verified: { type: Boolean, default: false },
    measuredAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: false }
);

const BodyMeasurementProfileSchema = new Schema<IBodyMeasurementProfile>(
  {
    customerId: { type: Types.ObjectId, ref: 'Customer', required: true, index: true },
    profileName: { type: String, required: true, default: 'Default Profile' },
    version: { type: Number, required: true, default: 1 },
    isCurrent: { type: Boolean, default: true, index: true },
    source: {
      type: String,
      required: true,
      enum: ['MANUAL', 'AI', 'TAILOR', 'IMPORTED'],
      default: 'MANUAL',
    },
    bodyShape: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    measurements: { type: Map, of: MeasurementValueSchema, default: {} },
  },
  { timestamps: true }
);

// Compound index for querying version history per customer
BodyMeasurementProfileSchema.index({ customerId: 1, version: -1 });

export const BodyMeasurementProfile = model<IBodyMeasurementProfile>(
  'BodyMeasurementProfile',
  BodyMeasurementProfileSchema
);
