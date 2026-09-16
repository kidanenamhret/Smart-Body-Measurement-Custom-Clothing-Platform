"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const CartItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClothingProduct', required: true },
    tailorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tailor', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    measurementProfileId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BodyMeasurementProfile', required: true },
    customization: { type: mongoose_1.Schema.Types.Mixed },
    calculatedPrice: { type: Number, required: true },
}, { _id: false });
const CartSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    items: [CartItemSchema],
    currency: { type: String, required: true, default: 'ETB' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual property for cart totals calculation
CartSchema.virtual('totals').get(function () {
    let subtotal = 0;
    let totalItems = 0;
    if (this.items && Array.isArray(this.items)) {
        for (const item of this.items) {
            const q = Number(item.quantity) || 1;
            const price = Number(item.calculatedPrice) || 0;
            subtotal += price * q;
            totalItems += q;
        }
    }
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        totalAmount: Math.round(subtotal * 100) / 100,
        totalItems,
        currency: this.currency || 'ETB',
    };
});
exports.Cart = (0, mongoose_1.model)('Cart', CartSchema);
