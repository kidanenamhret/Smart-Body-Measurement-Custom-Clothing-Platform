"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = void 0;
const mongoose_1 = require("mongoose");
const CouponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.Coupon = (0, mongoose_1.model)('Coupon', CouponSchema);
