"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTION_STAGE_PROGRESS = exports.PRODUCTION_STAGES = exports.ALLOWED_TRANSITIONS = exports.VALID_ORDER_STATUSES = void 0;
exports.validateStatusTransition = validateStatusTransition;
exports.getProductionStageProgress = getProductionStageProgress;
exports.validateProductionStageTransition = validateProductionStageTransition;
exports.VALID_ORDER_STATUSES = [
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
exports.ALLOWED_TRANSITIONS = {
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
function validateStatusTransition(currentStatus, nextStatus, actorRole) {
    if (currentStatus === nextStatus) {
        return { isValid: false, reason: `Order is already in '${currentStatus}' status.` };
    }
    if (!exports.VALID_ORDER_STATUSES.includes(nextStatus)) {
        return { isValid: false, reason: `'${nextStatus}' is not a valid OrderStatus.` };
    }
    const allowed = exports.ALLOWED_TRANSITIONS[currentStatus] || [];
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
        const customerAllowedNext = ['PAID', 'CANCELLED'];
        if (!customerAllowedNext.includes(nextStatus)) {
            return { isValid: false, reason: `Customers are not authorized to transition orders to '${nextStatus}'.` };
        }
    }
    if (role === 'TAILOR') {
        const tailorAllowedNext = [
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
        const deliveryAllowedNext = ['OUT_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_PICKUP'];
        if (!deliveryAllowedNext.includes(nextStatus)) {
            return { isValid: false, reason: `Delivery agents are not authorized to transition orders to '${nextStatus}'.` };
        }
    }
    return { isValid: true };
}
exports.PRODUCTION_STAGES = [
    'ORDER_ACCEPTED',
    'MEASUREMENT_VERIFIED',
    'CUTTING',
    'SEWING',
    'FINISHING',
    'QUALITY_CHECK',
    'READY',
];
exports.PRODUCTION_STAGE_PROGRESS = {
    ORDER_ACCEPTED: 0,
    MEASUREMENT_VERIFIED: 20,
    CUTTING: 40,
    SEWING: 60,
    FINISHING: 80,
    QUALITY_CHECK: 95,
    READY: 100,
};
function getProductionStageProgress(stage) {
    if (!stage)
        return 0;
    return exports.PRODUCTION_STAGE_PROGRESS[stage] ?? 0;
}
function validateProductionStageTransition(currentStage, nextStage) {
    if (!nextStage || !exports.PRODUCTION_STAGES.includes(nextStage)) {
        return { isValid: false, reason: `'${nextStage}' is not a valid Tailor Production Stage.` };
    }
    if (currentStage === nextStage) {
        return { isValid: false, reason: `Production is already at stage '${currentStage}'.` };
    }
    return { isValid: true };
}
