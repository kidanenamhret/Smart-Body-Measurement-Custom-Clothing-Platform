"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClothingCategory_1 = require("../models/ClothingCategory");
const ClothingProduct_1 = require("../models/ClothingProduct");
const auth_1 = require("../middleware/auth");
const measurements_1 = require("../utils/measurements");
const pricing_1 = require("../utils/pricing");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// =========================================================================
// 1. DATABASE-DRIVEN CATEGORIES ENDPOINTS
// =========================================================================
/**
 * GET /api/categories (also aliased under /api/products/categories)
 * Public endpoint to fetch all active clothing categories from the database.
 */
router.get('/categories', async (_req, res) => {
    try {
        let categories = await ClothingCategory_1.ClothingCategory.find({ isActive: true }).sort({ name: 1 });
        // Fallback seed if DB is empty on first query
        if (categories.length === 0) {
            await ClothingCategory_1.ClothingCategory.insertMany(ClothingCategory_1.INITIAL_CATEGORIES);
            categories = await ClothingCategory_1.ClothingCategory.find({ isActive: true }).sort({ name: 1 });
        }
        return res.json({ count: categories.length, categories });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching clothing categories', error: error.message });
    }
});
/**
 * POST /api/categories
 * Admin/System route to create a new database-driven category.
 */
router.post('/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, description, image } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existing = await ClothingCategory_1.ClothingCategory.findOne({ name });
        if (existing) {
            return res.status(409).json({ message: 'Category with this name already exists.' });
        }
        const category = new ClothingCategory_1.ClothingCategory({
            name,
            slug,
            description,
            image,
            isActive: true,
        });
        await category.save();
        return res.status(201).json({
            message: 'Category created successfully',
            category,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});
// =========================================================================
// 2. CLOTHING PRODUCTS ENDPOINTS
// =========================================================================
/**
 * GET /api/products
 * Public endpoint to list products with database category filtering, tailor filtering, and search.
 */
router.get('/products', async (req, res) => {
    try {
        const { categoryId, tailorId, search, status } = req.query;
        const query = {
            availabilityStatus: status || 'ACTIVE',
        };
        if (categoryId && mongoose_1.Types.ObjectId.isValid(categoryId)) {
            query.categoryId = new mongoose_1.Types.ObjectId(categoryId);
        }
        if (tailorId && mongoose_1.Types.ObjectId.isValid(tailorId)) {
            query.tailorId = new mongoose_1.Types.ObjectId(tailorId);
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const products = await ClothingProduct_1.ClothingProduct.find(query)
            .populate('categoryId', 'name slug description')
            .populate('tailorId', 'businessName profileImage averageRating location')
            .sort({ createdAt: -1 });
        return res.json({ count: products.length, products });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching clothing products', error: error.message });
    }
});
/**
 * GET /api/products/:id
 * Retrieve single clothing product details.
 */
router.get('/products/:id', async (req, res) => {
    try {
        const idParam = String(req.params.id);
        if (!mongoose_1.Types.ObjectId.isValid(idParam)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await ClothingProduct_1.ClothingProduct.findById(idParam)
            .populate('categoryId', 'name slug description')
            .populate('tailorId', 'businessName profileImage averageRating reviewCount businessAddress location');
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found' });
        }
        return res.json({ product });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});
/**
 * POST /api/products
 * Create a new clothing product (Requires Tailor or Admin role).
 */
router.post('/products', auth_1.authenticateToken, async (req, res) => {
    try {
        const { tailorId, categoryId, name, description, images, basePrice, currency, fabricOptions, colorOptions, customizationOptions, requiredMeasurements, productionTimeDays, productionTime, availabilityStatus, } = req.body;
        if (!tailorId || !categoryId || !name || basePrice === undefined) {
            return res.status(400).json({ message: 'tailorId, categoryId, name, and basePrice are required.' });
        }
        const days = productionTimeDays || (typeof productionTime === 'number' ? productionTime : parseInt(productionTime, 10)) || 7;
        const product = new ClothingProduct_1.ClothingProduct({
            tailorId: new mongoose_1.Types.ObjectId(String(tailorId)),
            categoryId: new mongoose_1.Types.ObjectId(String(categoryId)),
            name,
            description,
            images: images || [],
            basePrice: Number(basePrice),
            currency: currency || 'ETB',
            fabricOptions: fabricOptions || [],
            colorOptions: colorOptions || [],
            customizationOptions: customizationOptions || {},
            requiredMeasurements: requiredMeasurements || ['chest', 'waist'],
            productionTimeDays: days,
            availabilityStatus: availabilityStatus || 'ACTIVE',
        });
        await product.save();
        return res.status(201).json({
            message: 'Clothing product created successfully',
            product,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});
/**
 * PUT /api/products/:id
 * Update an existing clothing product.
 */
router.put('/products/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const idParam = String(req.params.id);
        if (!mongoose_1.Types.ObjectId.isValid(idParam)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await ClothingProduct_1.ClothingProduct.findById(idParam);
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found' });
        }
        const { name, description, images, basePrice, currency, fabricOptions, colorOptions, customizationOptions, requiredMeasurements, productionTimeDays, availabilityStatus, categoryId, } = req.body;
        if (name)
            product.name = name;
        if (description !== undefined)
            product.description = description;
        if (images)
            product.images = images;
        if (basePrice !== undefined)
            product.basePrice = Number(basePrice);
        if (currency)
            product.currency = currency;
        if (fabricOptions)
            product.fabricOptions = fabricOptions;
        if (colorOptions)
            product.colorOptions = colorOptions;
        if (customizationOptions)
            product.customizationOptions = customizationOptions;
        if (requiredMeasurements)
            product.requiredMeasurements = requiredMeasurements;
        if (productionTimeDays !== undefined)
            product.productionTimeDays = Number(productionTimeDays);
        if (availabilityStatus)
            product.availabilityStatus = availabilityStatus;
        if (categoryId && mongoose_1.Types.ObjectId.isValid(String(categoryId)))
            product.categoryId = new mongoose_1.Types.ObjectId(String(categoryId));
        await product.save();
        return res.json({
            message: 'Clothing product updated successfully',
            product,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});
/**
 * DELETE /api/products/:id
 * Soft-delete / deactivate product.
 */
router.delete('/products/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const idParam = String(req.params.id);
        if (!mongoose_1.Types.ObjectId.isValid(idParam)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await ClothingProduct_1.ClothingProduct.findById(idParam);
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found' });
        }
        product.availabilityStatus = 'INACTIVE';
        await product.save();
        return res.json({ message: 'Clothing product deactivated successfully', productId: product._id });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});
/**
 * POST /api/products/:id/verify-checkout
 * Pre-checkout verification endpoint ensuring all required measurements exist and satisfy plausible domain rules.
 */
router.post('/products/:id/verify-checkout', async (req, res) => {
    try {
        const idParam = String(req.params.id);
        if (!mongoose_1.Types.ObjectId.isValid(idParam)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await ClothingProduct_1.ClothingProduct.findById(idParam).populate('categoryId');
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found' });
        }
        const { userMeasurements } = req.body;
        // Determine required measurements: product requiredMeasurements or category defaults
        let requiredKeys = product.requiredMeasurements || [];
        if ((!requiredKeys || requiredKeys.length === 0) && product.categoryId && product.categoryId.requiredMeasurements) {
            requiredKeys = product.categoryId.requiredMeasurements;
        }
        const validation = (0, measurements_1.verifyRequiredMeasurements)(requiredKeys, userMeasurements || {});
        if (!validation.isValid) {
            return res.status(422).json({
                message: 'Pre-checkout measurement validation failed. Missing or invalid required anatomical measurements.',
                requiredMeasurements: requiredKeys,
                validation,
            });
        }
        return res.json({
            message: 'Pre-checkout measurement verification successful! All required measurements satisfied.',
            requiredMeasurements: requiredKeys,
            validation,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error performing pre-checkout verification', error: error.message });
    }
});
/**
 * POST /api/products/:id/calculate-price
 * Authoritative Server-Side Price Calculation Endpoint.
 * Computes base price + line item customization modifiers.
 * NEVER TRUST A TOTAL PRICE SUPPLIED BY THE FRONTEND.
 */
router.post('/products/:id/calculate-price', async (req, res) => {
    try {
        const idParam = String(req.params.id);
        if (!mongoose_1.Types.ObjectId.isValid(idParam)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const product = await ClothingProduct_1.ClothingProduct.findById(idParam);
        if (!product) {
            return res.status(404).json({ message: 'Clothing product not found' });
        }
        const { selectedCustomizations } = req.body;
        const priceCalculation = (0, pricing_1.calculateGarmentPrice)(product, selectedCustomizations || {});
        return res.json({
            message: 'Authoritative server-side price calculated successfully',
            productId: product._id,
            pricing: priceCalculation,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error calculating garment price', error: error.message });
    }
});
exports.default = router;
