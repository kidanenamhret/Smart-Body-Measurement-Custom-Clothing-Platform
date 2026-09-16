"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.Mixed, required: true },
    tailorId: { type: mongoose_1.Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true, min: 1 },
    measurementSnapshot: { type: mongoose_1.Schema.Types.Mixed, required: true },
    customization: { type: mongoose_1.Schema.Types.Mixed },
    priceSnapshot: { type: Number, required: true },
}, { _id: false });
const OrderHistorySchema = new mongoose_1.Schema({
    historyId: { type: String },
    orderId: { type: String },
    previousStatus: { type: String },
    newStatus: { type: String },
    actor: {
        userId: { type: String },
        role: { type: String },
        name: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
    // Legacy fields
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    orderId: { type: String, required: true, default: () => `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`, index: true },
    customerId: { type: mongoose_1.Schema.Types.Mixed, required: true, index: true },
    tailorId: { type: mongoose_1.Schema.Types.Mixed, required: true, index: true },
    productId: { type: mongoose_1.Schema.Types.Mixed },
    customerSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    tailorSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    productSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    customization: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    measurementSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    pricingSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    paymentInfo: { type: mongoose_1.Schema.Types.Mixed },
    deliveryInfo: { type: mongoose_1.Schema.Types.Mixed },
    quantity: { type: Number, default: 1 },
    status: {
        type: String,
        required: true,
        default: 'PENDING_PAYMENT',
        index: true,
    },
    productionStage: { type: String },
    productionProgressPercent: { type: Number, default: 0 },
    productionNotes: { type: String },
    statusHistory: [OrderHistorySchema],
    // Legacy fields
    items: [OrderItemSchema],
    totalAmount: { type: Number },
    currency: { type: String, default: 'ETB' },
    measurementProfileId: { type: mongoose_1.Schema.Types.Mixed },
    measurementVerified: { type: Boolean, default: false },
    measurementVerifiedAt: { type: Date },
    productionStatus: { type: String },
    qualityChecked: { type: Boolean, default: false },
    qualityCheckNotes: { type: String },
    qualityCheckedAt: { type: Date },
    rejectionReason: { type: String },
    readyAt: { type: Date },
    paymentId: { type: mongoose_1.Schema.Types.Mixed },
    deliveryId: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
