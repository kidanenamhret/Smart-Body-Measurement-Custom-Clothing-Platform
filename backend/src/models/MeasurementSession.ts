import { Schema, model, Document, Types } from 'mongoose';

export type MeasurementSessionStatus =
  | 'CREATED'
  | 'CAPTURING'
  | 'PROCESSING'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED';

export interface IMeasurementSession extends Document {
  customerId: Types.ObjectId;
  captureType: 'MANUAL' | 'AI';
  frontCaptureUrl?: string;
  sideCaptureUrl?: string;
  frontCapture?: string;
  sideCapture?: string;
  heightReference?: string;
  landmarks?: Record<string, any>; // raw AI body landmarks
  estimatedMeasurements?: Record<string, any>;
  confidenceScores?: Record<string, number>;
  warnings?: string[];
  status: MeasurementSessionStatus;
  createdAt: Date;
  completedAt?: Date;
}

const MeasurementSessionSchema = new Schema<IMeasurementSession>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    captureType: { type: String, required: true, enum: ['MANUAL', 'AI'], default: 'AI' },
    frontCaptureUrl: { type: String },
    sideCaptureUrl: { type: String },
    heightReference: { type: String },
    landmarks: { type: Schema.Types.Mixed },
    estimatedMeasurements: { type: Schema.Types.Mixed },
    confidenceScores: { type: Schema.Types.Mixed },
    warnings: [{ type: String }],
    status: {
      type: String,
      enum: ['CREATED', 'CAPTURING', 'PROCESSING', 'REVIEW_REQUIRED', 'VERIFIED', 'FAILED', 'CANCELLED'],
      default: 'CREATED',
    },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for sessionId
MeasurementSessionSchema.virtual('sessionId').get(function (this: IMeasurementSession) {
  return (this._id as any)?.toString();
});

// Virtual properties for frontCapture and sideCapture
MeasurementSessionSchema.virtual('frontCapture')
  .get(function (this: IMeasurementSession) {
    return this.frontCaptureUrl;
  })
  .set(function (this: IMeasurementSession, val: string) {
    this.frontCaptureUrl = val;
  });

MeasurementSessionSchema.virtual('sideCapture')
  .get(function (this: IMeasurementSession) {
    return this.sideCaptureUrl;
  })
  .set(function (this: IMeasurementSession, val: string) {
    this.sideCaptureUrl = val;
  });

export const MeasurementSession = model<IMeasurementSession>('MeasurementSession', MeasurementSessionSchema);

