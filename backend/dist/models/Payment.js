"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Types.ObjectId, ref: 'Order', required: true, index: true },
    customerId: { type: mongoose_1.Types.ObjectId, ref: 'Customer', required: true, index: true },
    tailorId: { type: mongoose_1.Types.ObjectId, ref: 'Tailor', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB' },
    paymentMethod: {
        type: String,
        default: 'TELEBIRR',
    },
    transactionReference: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
        default: 'PENDING',
        index: true,
    },
    paidAt: { type: Date },
    notes: { type: String },
}, { timestamps: true });
exports.Payment = (0, mongoose_1.model)('Payment', PaymentSchema);
