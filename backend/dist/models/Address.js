"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.Mixed, required: true, index: true },
    label: { type: String, enum: ['HOME', 'WORK', 'WORKSHOP', 'OTHER'], default: 'HOME' },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    region: { type: String, required: true, default: 'Addis Ababa' },
    city: { type: String, required: true, default: 'Addis Ababa' },
    subCity: { type: String },
    woreda: { type: String },
    street: { type: String },
    additionalInformation: { type: String },
    isDefault: { type: Boolean, default: false },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
}, { timestamps: true });
exports.Address = (0, mongoose_1.model)('Address', AddressSchema);
