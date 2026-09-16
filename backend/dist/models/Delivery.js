"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delivery = void 0;
const mongoose_1 = require("mongoose");
const DeliverySchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.Mixed, required: true, index: true },
    deliveryAgentId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    tailorId: { type: mongoose_1.Schema.Types.Mixed },
    customerId: { type: mongoose_1.Schema.Types.Mixed },
    pickupInfo: {
        businessName: { type: String, required: true },
        address: { type: String, required: true },
        contactPhone: { type: String, required: true },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        notes: { type: String },
    },
    deliveryInfo: {
        recipientName: { type: String, required: true },
        address: { type: String, required: true },
        contactPhone: { type: String, required: true },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        notes: { type: String },
    },
    status: {
        type: String,
        default: 'PENDING',
        index: true,
    },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    pickupConfirmedAt: { type: Date },
    deliveryConfirmedAt: { type: Date },
    proofOfDelivery: {
        recipientName: { type: String },
        notes: { type: String },
        photoUrl: { type: String },
        signatureUrl: { type: String },
    },
    notes: { type: String },
    trackingHistory: [
        {
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            location: {
                lat: { type: Number },
                lng: { type: Number },
            },
            note: { type: String },
        },
    ],
}, { timestamps: true });
exports.Delivery = (0, mongoose_1.model)('Delivery', DeliverySchema);
