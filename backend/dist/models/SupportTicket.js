"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportTicket = void 0;
const mongoose_1 = require("mongoose");
const SupportTicketSchema = new mongoose_1.Schema({
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    userRole: {
        type: String,
        enum: ['CUSTOMER', 'TAILOR', 'DELIVERY_AGENT', 'ADMIN'],
        required: true,
    },
    type: {
        type: String,
        enum: ['COMPLAINT', 'ORDER_ISSUE', 'PAYMENT_ISSUE', 'GENERAL', 'DISPUTE'],
        default: 'GENERAL',
    },
    orderId: { type: mongoose_1.Types.ObjectId, ref: 'Order' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN',
        index: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
    },
    resolutionNotes: { type: String },
    messages: [
        {
            senderId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
            senderRole: { type: String, required: true },
            senderName: { type: String, required: true },
            message: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
exports.SupportTicket = (0, mongoose_1.model)('SupportTicket', SupportTicketSchema);
