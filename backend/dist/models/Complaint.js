"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Complaint = void 0;
const mongoose_1 = require("mongoose");
const ComplaintSchema = new mongoose_1.Schema({
    complaintId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose_1.Types.ObjectId, ref: 'Customer', required: true, index: true },
    orderId: { type: mongoose_1.Types.ObjectId, ref: 'Order' },
    tailorId: { type: mongoose_1.Types.ObjectId, ref: 'Tailor' },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
        default: 'OPEN',
        index: true,
    },
    resolution: { type: String },
}, { timestamps: true });
exports.Complaint = (0, mongoose_1.model)('Complaint', ComplaintSchema);
