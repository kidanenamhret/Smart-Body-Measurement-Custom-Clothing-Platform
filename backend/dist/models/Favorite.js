"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
const FavoriteSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClothingProduct' },
    tailorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tailor' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
FavoriteSchema.virtual('favoriteId').get(function () {
    return this._id?.toString();
});
// Ensure a customer cannot favorite the same entity twice
FavoriteSchema.index({ customerId: 1, productId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ customerId: 1, tailorId: 1 }, { unique: true, sparse: true });
exports.Favorite = (0, mongoose_1.model)('Favorite', FavoriteSchema);
