import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditActor {
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
}

export interface IAuditLog extends Document {
  actor: IAuditActor;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      userId: { type: String },
      role: { type: String },
      name: { type: String },
      email: { type: String },
    },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: false }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
