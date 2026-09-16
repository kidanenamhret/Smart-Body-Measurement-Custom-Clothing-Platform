"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSetting = void 0;
const mongoose_1 = require("mongoose");
const SystemSettingSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose_1.Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['GENERAL', 'FINANCIAL', 'DELIVERY', 'MAINTENANCE'],
        default: 'GENERAL',
    },
    updatedBy: { type: mongoose_1.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
exports.SystemSetting = (0, mongoose_1.model)('SystemSetting', SystemSettingSchema);
