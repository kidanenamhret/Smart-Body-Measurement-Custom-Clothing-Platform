"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tailor = void 0;
const mongoose_1 = require("mongoose");
const TailorSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true },
    description: { type: String },
    phone: { type: String },
    businessAddress: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number },
    },
    profileImage: { type: String },
    businessImages: [{ type: String }],
    verificationDocuments: [{ type: String }],
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
        default: 'PENDING',
    },
    services: [{ type: String }],
    averageRating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.Tailor = (0, mongoose_1.model)('Tailor', TailorSchema);
