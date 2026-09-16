"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Favorite_1 = require("../models/Favorite");
const Customer_1 = require("../models/Customer");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// All favorites routes require authentication
router.use(auth_1.authenticateToken);
async function getOrCreateCustomer(userId) {
    let customer = await Customer_1.Customer.findOne({ userId });
    if (!customer) {
        customer = new Customer_1.Customer({ userId: new mongoose_1.Types.ObjectId(userId) });
        await customer.save();
    }
    return customer;
}
/**
 * GET /api/favorites
 * List all favorited garments and tailors for the authenticated customer.
 */
router.get('/', async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ userId: req.user.sub });
        if (!customer) {
            return res.json({ favorites: [] });
        }
        const favorites = await Favorite_1.Favorite.find({ customerId: customer._id })
            .populate('productId', 'name images basePrice currency availabilityStatus categoryId')
            .populate('tailorId', 'businessName profileImage averageRating reviewCount location businessAddress')
            .sort({ createdAt: -1 });
        return res.json({ count: favorites.length, favorites });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
});
/**
 * POST /api/favorites
 * Add a clothing product or tailor to customer's favorites.
 * PREVENT DUPLICATE FAVORITE RECORDS.
 */
router.post('/', async (req, res) => {
    try {
        const customer = await getOrCreateCustomer(req.user.sub);
        const { productId, tailorId } = req.body;
        if (!productId && !tailorId) {
            return res.status(400).json({ message: 'Either productId or tailorId must be provided.' });
        }
        // Check for existing duplicate record
        const duplicateQuery = { customerId: customer._id };
        if (productId && mongoose_1.Types.ObjectId.isValid(String(productId))) {
            duplicateQuery.productId = new mongoose_1.Types.ObjectId(String(productId));
        }
        else if (tailorId && mongoose_1.Types.ObjectId.isValid(String(tailorId))) {
            duplicateQuery.tailorId = new mongoose_1.Types.ObjectId(String(tailorId));
        }
        const existing = await Favorite_1.Favorite.findOne(duplicateQuery);
        if (existing) {
            return res.status(409).json({
                message: 'Duplicate favorite record prevented. Item is already in favorites.',
                favorite: existing,
            });
        }
        const favorite = new Favorite_1.Favorite({
            customerId: customer._id,
            productId: productId && mongoose_1.Types.ObjectId.isValid(String(productId)) ? new mongoose_1.Types.ObjectId(String(productId)) : undefined,
            tailorId: tailorId && mongoose_1.Types.ObjectId.isValid(String(tailorId)) ? new mongoose_1.Types.ObjectId(String(tailorId)) : undefined,
        });
        await favorite.save();
        return res.status(201).json({
            message: 'Item added to favorites successfully',
            favorite,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate favorite record prevented.' });
        }
        return res.status(500).json({ message: 'Error adding favorite', error: error.message });
    }
});
/**
 * DELETE /api/favorites/:id
 * Remove an item from favorites.
 */
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ userId: req.user.sub });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found.' });
        }
        const idParam = String(req.params.id);
        const deleted = await Favorite_1.Favorite.findOneAndDelete({
            _id: idParam,
            customerId: customer._id,
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Favorite record not found.' });
        }
        return res.json({ message: 'Favorite item removed successfully', favoriteId: idParam });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error removing favorite', error: error.message });
    }
});
exports.default = router;
