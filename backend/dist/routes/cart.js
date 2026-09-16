"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Cart_1 = require("../models/Cart");
const Customer_1 = require("../models/Customer");
const ClothingProduct_1 = require("../models/ClothingProduct");
const pricing_1 = require("../utils/pricing");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// All cart routes require authentication
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
 * Helper function to recalculate and validate all cart item prices server-side.
 * Never trust prices supplied by the client!
 */
async function recalculateCartPrices(cart) {
    if (!cart.items || cart.items.length === 0)
        return cart;
    for (const item of cart.items) {
        const product = await ClothingProduct_1.ClothingProduct.findById(item.productId);
        if (product) {
            const serverPrice = (0, pricing_1.calculateGarmentPrice)(product, item.customization || {});
            item.calculatedPrice = serverPrice.totalCalculatedPrice;
        }
    }
    await cart.save();
    return cart;
}
/**
 * GET /api/cart
 * Fetch customer's active shopping cart with populated item details and server-recalculated pricing totals.
 */
router.get('/', async (req, res) => {
    try {
        const customer = await getOrCreateCustomer(req.user.sub);
        let cart = await Cart_1.Cart.findOne({ customerId: customer._id })
            .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
            .populate('items.tailorId', 'businessName profileImage location')
            .populate('items.measurementProfileId', 'profileName version bodyShape');
        if (!cart) {
            cart = new Cart_1.Cart({
                customerId: customer._id,
                items: [],
                currency: 'ETB',
            });
            await cart.save();
        }
        else {
            await recalculateCartPrices(cart);
        }
        return res.json({ cart });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});
/**
 * POST /api/cart/items
 * Add an item to cart or update existing quantity.
 * Mandatory Server-Side Price Calculation!
 */
router.post('/items', async (req, res) => {
    try {
        const customer = await getOrCreateCustomer(req.user.sub);
        const { productId, tailorId, quantity, measurementProfileId, customization } = req.body;
        if (!productId || !tailorId || !measurementProfileId) {
            return res.status(400).json({ message: 'productId, tailorId, and measurementProfileId are required.' });
        }
        const prodIdStr = String(productId);
        const product = await ClothingProduct_1.ClothingProduct.findById(prodIdStr);
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found.' });
        }
        // Authoritatively calculate price on the backend
        const priceCalculation = (0, pricing_1.calculateGarmentPrice)(product, customization || {});
        const authoritativePrice = priceCalculation.totalCalculatedPrice;
        let cart = await Cart_1.Cart.findOne({ customerId: customer._id });
        if (!cart) {
            cart = new Cart_1.Cart({
                customerId: customer._id,
                items: [],
                currency: product.currency || 'ETB',
            });
        }
        const q = Number(quantity) > 0 ? Number(quantity) : 1;
        // Check if item with same productId and customization already exists in cart
        const existingIndex = cart.items.findIndex((item) => String(item.productId) === prodIdStr);
        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += q;
            cart.items[existingIndex].customization = customization || cart.items[existingIndex].customization;
            cart.items[existingIndex].calculatedPrice = authoritativePrice;
            cart.items[existingIndex].measurementProfileId = new mongoose_1.Types.ObjectId(String(measurementProfileId));
        }
        else {
            cart.items.push({
                productId: new mongoose_1.Types.ObjectId(prodIdStr),
                tailorId: new mongoose_1.Types.ObjectId(String(tailorId)),
                quantity: q,
                measurementProfileId: new mongoose_1.Types.ObjectId(String(measurementProfileId)),
                customization: customization || {},
                calculatedPrice: authoritativePrice,
            });
        }
        await cart.save();
        // Re-populate details for response
        const populatedCart = await Cart_1.Cart.findById(cart._id)
            .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
            .populate('items.tailorId', 'businessName profileImage location')
            .populate('items.measurementProfileId', 'profileName version bodyShape');
        return res.status(201).json({
            message: 'Item added to cart with server-validated price!',
            cart: populatedCart,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
});
/**
 * PUT /api/cart/items/:productId
 * Update quantity or customization of a cart item with server price recalculation.
 */
router.put('/items/:productId', async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ userId: req.user.sub });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found.' });
        }
        const prodIdStr = String(req.params.productId);
        const { quantity, customization, measurementProfileId } = req.body;
        const cart = await Cart_1.Cart.findOne({ customerId: customer._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        const item = cart.items.find((i) => String(i.productId) === prodIdStr);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart.' });
        }
        if (quantity !== undefined && Number(quantity) > 0) {
            item.quantity = Number(quantity);
        }
        if (measurementProfileId && mongoose_1.Types.ObjectId.isValid(String(measurementProfileId))) {
            item.measurementProfileId = new mongoose_1.Types.ObjectId(String(measurementProfileId));
        }
        if (customization) {
            item.customization = customization;
        }
        // Re-evaluate item price server-side
        const product = await ClothingProduct_1.ClothingProduct.findById(prodIdStr);
        if (product) {
            const serverPrice = (0, pricing_1.calculateGarmentPrice)(product, item.customization || {});
            item.calculatedPrice = serverPrice.totalCalculatedPrice;
        }
        await cart.save();
        const populatedCart = await Cart_1.Cart.findById(cart._id)
            .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
            .populate('items.tailorId', 'businessName profileImage location')
            .populate('items.measurementProfileId', 'profileName version bodyShape');
        return res.json({
            message: 'Cart item updated and price recalculated server-side!',
            cart: populatedCart,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
});
/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart.
 */
router.delete('/items/:productId', async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ userId: req.user.sub });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found.' });
        }
        const prodIdStr = String(req.params.productId);
        const cart = await Cart_1.Cart.findOne({ customerId: customer._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        cart.items = cart.items.filter((i) => String(i.productId) !== prodIdStr);
        await cart.save();
        const populatedCart = await Cart_1.Cart.findById(cart._id)
            .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
            .populate('items.tailorId', 'businessName profileImage location')
            .populate('items.measurementProfileId', 'profileName version bodyShape');
        return res.json({
            message: 'Item removed from cart',
            cart: populatedCart,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
});
/**
 * DELETE /api/cart
 * Clear entire cart.
 */
router.delete('/', async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findOne({ userId: req.user.sub });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found.' });
        }
        const cart = await Cart_1.Cart.findOne({ customerId: customer._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return res.json({ message: 'Cart cleared successfully', cart });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
});
exports.default = router;
