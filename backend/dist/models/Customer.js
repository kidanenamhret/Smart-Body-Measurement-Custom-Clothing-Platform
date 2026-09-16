"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const CustomerSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, unique: true },
    profileImage: { type: String },
    dateOfBirth: { type: Date },
    preferences: { type: mongoose_1.Schema.Types.Mixed },
    defaultMeasurementProfileId: { type: mongoose_1.Types.ObjectId, ref: 'BodyMeasurementProfile' },
    defaultAddressId: { type: mongoose_1.Types.ObjectId, ref: 'Address' },
}, { timestamps: true });
exports.Customer = (0, mongoose_1.model)('Customer', CustomerSchema);
