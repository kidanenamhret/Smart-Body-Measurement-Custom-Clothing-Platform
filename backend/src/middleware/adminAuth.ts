import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { logAuditEvent } from '../utils/auditLogger';

export interface AdminRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    email: string;
  };
}

/**
 * Ensures authenticated user has role 'ADMIN'.
 */
export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Administrator privileges required.' });
  }
  next();
};

/**
 * Utility helper to record administrative actions into the Audit Log.
 */
export async function logAdminAction(
  adminId: string | Types.ObjectId,
  action: string,
  targetEntity: string,
  targetId?: string | Types.ObjectId,
  details?: Record<string, any>,
  req?: Request
) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress : undefined;
    await logAuditEvent(
      { userId: adminId.toString(), role: 'ADMIN' },
      action,
      targetEntity,
      targetId ? targetId.toString() : undefined,
      details,
      ipAddress
    );
  } catch (error: any) {
    console.error('Failed to write audit log:', error.message);
  }
}
