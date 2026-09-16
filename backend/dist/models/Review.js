"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Types.ObjectId, ref: 'Customer', required: true, index: true },
    tailorId: { type: mongoose_1.Types.ObjectId, ref: 'Tailor', required: true, index: true },
    orderId: { type: mongoose_1.Types.ObjectId, ref: 'Order', unique: true, sparse: true, index: true },
    productId: { type: mongoose_1.Types.ObjectId, ref: 'ClothingProduct' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    photos: [{ type: String }],
}, { timestamps: true });
exports.Review = (0, mongoose_1.model)('Review', ReviewSchema);
