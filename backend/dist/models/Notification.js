"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    recipientId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: {
        type: String,
        enum: ['CUSTOMER', 'TAILOR', 'DELIVERY_AGENT', 'ADMIN'],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, default: 'INFO' },
    data: { type: mongoose_1.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
