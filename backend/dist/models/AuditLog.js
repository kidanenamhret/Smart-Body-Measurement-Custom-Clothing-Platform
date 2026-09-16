"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const AuditLogSchema = new mongoose_1.Schema({
    actor: {
        userId: { type: String },
        role: { type: String },
        name: { type: String },
        email: { type: String },
    },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    ipAddress: { type: String },
}, { timestamps: false });
exports.AuditLog = (0, mongoose_1.model)('AuditLog', AuditLogSchema);
