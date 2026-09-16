import { AuditLog, IAuditActor } from '../models/AuditLog';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'authheader',
  'cvv',
  'cardnumber',
  'apikey',
  'privatekey',
  'pin',
];

export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function logAuditEvent(
  actor: IAuditActor,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  ipAddress?: string
) {
  try {
    const sanitizedMeta = sanitizeMetadata(metadata);
    await AuditLog.create({
      actor: {
        userId: actor.userId || 'system',
        role: actor.role || 'SYSTEM',
        name: actor.name || 'System Engine',
        email: actor.email,
      },
      action,
      resource,
      resourceId,
      timestamp: new Date(),
      metadata: sanitizedMeta,
      ipAddress,
    });
  } catch (err) {
    console.error('Failed to persist audit log record:', err);
  }
}
