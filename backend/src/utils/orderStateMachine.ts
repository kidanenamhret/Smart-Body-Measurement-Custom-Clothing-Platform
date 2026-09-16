import { OrderStatus } from '../models/Order';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PENDING_TAILOR',
  'ACCEPTED',
  'MEASUREMENT_VERIFICATION',
  'IN_PRODUCTION',
  'QUALITY_CHECK',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'REJECTED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED',
];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PENDING_TAILOR', 'ACCEPTED', 'CANCELLED'],
  PENDING_TAILOR: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['MEASUREMENT_VERIFICATION', 'IN_PRODUCTION', 'CANCELLED'],
  MEASUREMENT_VERIFICATION: ['IN_PRODUCTION', 'REJECTED', 'CANCELLED'],
  IN_PRODUCTION: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['READY_FOR_PICKUP', 'IN_PRODUCTION', 'REJECTED'],
  READY_FOR_PICKUP: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'READY_FOR_PICKUP'],
  DELIVERED: [],
  REJECTED: ['REFUND_PENDING', 'REFUNDED'],
  CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],

  // Legacy aliases for backward compatibility
  PENDING_ACCEPTANCE: ['ACCEPTED', 'REJECTED'],
  MEASUREMENTS_VERIFIED: ['IN_PRODUCTION'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  COMPLETED: [],
};

export interface StatusValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  actorRole: string
): StatusValidationResult {
  if (currentStatus === nextStatus) {
    return { isValid: false, reason: `Order is already in '${currentStatus}' status.` };
  }

  if (!VALID_ORDER_STATUSES.includes(nextStatus)) {
    return { isValid: false, reason: `'${nextStatus}' is not a valid OrderStatus.` };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      isValid: false,
      reason: `Illegal state transition from '${currentStatus}' to '${nextStatus}'. Allowed next statuses: [${allowed.join(', ')}]`,
    };
  }

  // Role permissions check
  const role = actorRole ? actorRole.toUpperCase() : 'CUSTOMER';

  if (role === 'ADMIN') {
    return { isValid: true };
  }

  if (role === 'CUSTOMER') {
    const customerAllowedNext: OrderStatus[] = ['PAID', 'CANCELLED'];
    if (!customerAllowedNext.includes(nextStatus)) {
      return { isValid: false, reason: `Customers are not authorized to transition orders to '${nextStatus}'.` };
    }
  }

  if (role === 'TAILOR') {
    const tailorAllowedNext: OrderStatus[] = [
      'ACCEPTED',
      'REJECTED',
      'MEASUREMENT_VERIFICATION',
      'IN_PRODUCTION',
      'QUALITY_CHECK',
      'READY_FOR_PICKUP',
      'CANCELLED',
    ];
    if (!tailorAllowedNext.includes(nextStatus)) {
      return { isValid: false, reason: `Tailors are not authorized to transition orders to '${nextStatus}'.` };
    }
  }

  if (role === 'DELIVERY_AGENT') {
    const deliveryAllowedNext: OrderStatus[] = ['OUT_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_PICKUP'];
    if (!deliveryAllowedNext.includes(nextStatus)) {
      return { isValid: false, reason: `Delivery agents are not authorized to transition orders to '${nextStatus}'.` };
    }
  }

  return { isValid: true };
}

export type TailorProductionStage =
  | 'ORDER_ACCEPTED'
  | 'MEASUREMENT_VERIFIED'
  | 'CUTTING'
  | 'SEWING'
  | 'FINISHING'
  | 'QUALITY_CHECK'
  | 'READY';

export const PRODUCTION_STAGES: TailorProductionStage[] = [
  'ORDER_ACCEPTED',
  'MEASUREMENT_VERIFIED',
  'CUTTING',
  'SEWING',
  'FINISHING',
  'QUALITY_CHECK',
  'READY',
];

export const PRODUCTION_STAGE_PROGRESS: Record<TailorProductionStage, number> = {
  ORDER_ACCEPTED: 0,
  MEASUREMENT_VERIFIED: 20,
  CUTTING: 40,
  SEWING: 60,
  FINISHING: 80,
  QUALITY_CHECK: 95,
  READY: 100,
};

export function getProductionStageProgress(stage?: TailorProductionStage | string): number {
  if (!stage) return 0;
  return PRODUCTION_STAGE_PROGRESS[stage as TailorProductionStage] ?? 0;
}

export function validateProductionStageTransition(
  currentStage?: string,
  nextStage?: string
): StatusValidationResult {
  if (!nextStage || !PRODUCTION_STAGES.includes(nextStage as TailorProductionStage)) {
    return { isValid: false, reason: `'${nextStage}' is not a valid Tailor Production Stage.` };
  }

  if (currentStage === nextStage) {
    return { isValid: false, reason: `Production is already at stage '${currentStage}'.` };
  }

  return { isValid: true };
}
