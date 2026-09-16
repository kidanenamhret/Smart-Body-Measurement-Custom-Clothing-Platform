import { Request, Response, NextFunction } from 'express';
import { DeliveryAgent, IDeliveryAgent } from '../models/DeliveryAgent';

export interface DeliveryAgentRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    email: string;
  };
  deliveryAgent?: IDeliveryAgent;
}

/**
 * Ensures authenticated user has role 'DELIVERY_AGENT'.
 */
export const requireDeliveryAgentRole = (
  req: DeliveryAgentRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'DELIVERY_AGENT') {
    return res.status(403).json({ message: 'Access denied: Delivery Agent role required.' });
  }
  next();
};

/**
 * Ensures authenticated user has role 'DELIVERY_AGENT' and an active profile.
 */
export const requireDeliveryAgentProfile = async (
  req: DeliveryAgentRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'DELIVERY_AGENT') {
    return res.status(403).json({ message: 'Access denied: Delivery Agent role required.' });
  }

  try {
    const agent = await DeliveryAgent.findOne({ userId: req.user.sub });
    if (!agent) {
      return res.status(404).json({
        message: 'Delivery agent profile not found. Please create your profile first.',
      });
    }
    req.deliveryAgent = agent;
    next();
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Error retrieving delivery agent profile', error: error.message });
  }
};
