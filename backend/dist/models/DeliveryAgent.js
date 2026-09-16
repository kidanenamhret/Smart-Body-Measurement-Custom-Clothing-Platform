"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAgent = void 0;
const mongoose_1 = require("mongoose");
const DeliveryAgentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String },
    vehicleType: { type: String, default: 'Motorcycle' },
    licensePlate: { type: String },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ON_DELIVERY', 'OFFLINE'],
        default: 'AVAILABLE',
        index: true,
    },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        lastUpdated: { type: Date },
    },
    completedDeliveriesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.DeliveryAgent = (0, mongoose_1.model)('DeliveryAgent', DeliveryAgentSchema);
