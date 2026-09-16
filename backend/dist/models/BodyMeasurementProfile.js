"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyMeasurementProfile = void 0;
const mongoose_1 = require("mongoose");
const MeasurementValueSchema = new mongoose_1.Schema({
    value: { type: Number, required: true },
    unit: { type: String, required: true, default: 'cm' },
    source: {
        type: String,
        required: true,
        enum: ['MANUAL', 'AI', 'TAILOR', 'IMPORTED'],
        default: 'MANUAL',
    },
    confidence: { type: Number, min: 0, max: 1, default: 1.0 },
    verified: { type: Boolean, default: false },
    measuredAt: { type: Date, default: Date.now },
    notes: { type: String },
}, { _id: false });
const BodyMeasurementProfileSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Types.ObjectId, ref: 'Customer', required: true, index: true },
    profileName: { type: String, required: true, default: 'Default Profile' },
    version: { type: Number, required: true, default: 1 },
    isCurrent: { type: Boolean, default: true, index: true },
    source: {
        type: String,
        required: true,
        enum: ['MANUAL', 'AI', 'TAILOR', 'IMPORTED'],
        default: 'MANUAL',
    },
    bodyShape: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    measurements: { type: Map, of: MeasurementValueSchema, default: {} },
}, { timestamps: true });
// Compound index for querying version history per customer
BodyMeasurementProfileSchema.index({ customerId: 1, version: -1 });
exports.BodyMeasurementProfile = (0, mongoose_1.model)('BodyMeasurementProfile', BodyMeasurementProfileSchema);
