"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClothingProduct = void 0;
const mongoose_1 = require("mongoose");
const ClothingProductSchema = new mongoose_1.Schema({
    tailorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tailor', required: true, index: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClothingCategory', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    basePrice: { type: Number, required: true },
    currency: { type: String, required: true, default: 'ETB' },
    availableSizes: [{ type: String }],
    fabricOptions: [{ type: String }],
    colorOptions: [{ type: String }],
    customizationOptions: { type: mongoose_1.Schema.Types.Mixed },
    requiredMeasurements: [{ type: String, required: true }],
    productionTimeDays: { type: Number, default: 7 },
    availabilityStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], default: 'ACTIVE' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
ClothingProductSchema.virtual('productId').get(function () {
    return this._id?.toString();
});
ClothingProductSchema.virtual('productionTime')
    .get(function () {
    return this.productionTimeDays ? `${this.productionTimeDays} days` : '7 days';
})
    .set(function (val) {
    if (typeof val === 'number') {
        this.productionTimeDays = val;
    }
    else if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed))
            this.productionTimeDays = parsed;
    }
});
exports.ClothingProduct = (0, mongoose_1.model)('ClothingProduct', ClothingProductSchema);
