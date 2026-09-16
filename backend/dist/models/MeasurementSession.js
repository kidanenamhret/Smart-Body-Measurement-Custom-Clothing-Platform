"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementSession = void 0;
const mongoose_1 = require("mongoose");
const MeasurementSessionSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    captureType: { type: String, required: true, enum: ['MANUAL', 'AI'], default: 'AI' },
    frontCaptureUrl: { type: String },
    sideCaptureUrl: { type: String },
    heightReference: { type: String },
    landmarks: { type: mongoose_1.Schema.Types.Mixed },
    estimatedMeasurements: { type: mongoose_1.Schema.Types.Mixed },
    confidenceScores: { type: mongoose_1.Schema.Types.Mixed },
    warnings: [{ type: String }],
    status: {
        type: String,
        enum: ['CREATED', 'CAPTURING', 'PROCESSING', 'REVIEW_REQUIRED', 'VERIFIED', 'FAILED', 'CANCELLED'],
        default: 'CREATED',
    },
    completedAt: { type: Date },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual property for sessionId
MeasurementSessionSchema.virtual('sessionId').get(function () {
    return this._id?.toString();
});
// Virtual properties for frontCapture and sideCapture
MeasurementSessionSchema.virtual('frontCapture')
    .get(function () {
    return this.frontCaptureUrl;
})
    .set(function (val) {
    this.frontCaptureUrl = val;
});
MeasurementSessionSchema.virtual('sideCapture')
    .get(function () {
    return this.sideCaptureUrl;
})
    .set(function (val) {
    this.sideCaptureUrl = val;
});
exports.MeasurementSession = (0, mongoose_1.model)('MeasurementSession', MeasurementSessionSchema);
