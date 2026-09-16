import { Request, Response, NextFunction } from 'express';
import { Tailor, ITailor } from '../models/Tailor';

export interface TailorRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    email: string;
  };
  tailor?: ITailor;
}

/**
 * Middleware ensuring the authenticated user has the 'TAILOR' role.
 * Used for endpoints before a profile is created (e.g., initial profile creation).
 */
export const requireTailorRole = (req: TailorRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'TAILOR') {
    return res.status(403).json({ message: 'Access denied: Tailor role required.' });
  }
  next();
};

/**
 * Middleware ensuring the authenticated user has a 'TAILOR' role
 * AND has an existing Tailor business profile, attaching it to `req.tailor`.
 */
export const requireTailorProfile = async (req: TailorRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'TAILOR') {
    return res.status(403).json({ message: 'Access denied: Tailor role required.' });
  }

  try {
    const tailor = await Tailor.findOne({ userId: req.user.sub });
    if (!tailor) {
      return res.status(404).json({
        message: 'Tailor profile not found. Please create your business profile first.',
      });
    }
    req.tailor = tailor;
    next();
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching tailor profile', error: error.message });
  }
};
