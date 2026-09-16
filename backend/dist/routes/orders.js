"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = require("../models/Order");
const orderStateMachine_1 = require("../utils/orderStateMachine");
const pricing_1 = require("../utils/pricing");
const router = (0, express_1.Router)();
// In-memory fallback orders for offline/demo mode if database is not populated
let memoryOrders = [];
// Utility helper to generate readable order numbers (e.g. ORD-2026-8801)
function generateOrderId() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-2026-${rand}`;
}
/**
 * POST /api/orders
 * Create a new custom clothing order with immutable historical snapshots.
 */
router.post('/', async (req, res) => {
    try {
        const { customerId = 'cust-101', tailorId = '1', productId = '1', quantity = 1, customization = {}, measurementProfile = {}, deliveryInfo = {}, paymentMethod = 'TELEBIRR', } = req.body;
        // Build immutable product snapshot
        const productSnapshot = {
            productId: String(productId),
            name: req.body.productName || 'Custom Three-Piece Tuxedo',
            categoryName: req.body.categoryName || 'Suit',
            image: req.body.productImage || '/sample_custom_tuxedo.jpg',
            basePrice: Number(req.body.basePrice) || 12500,
        };
        // Calculate authoritative pricing snapshot
        const pricingSnapshot = (0, pricing_1.calculateGarmentPrice)({ basePrice: productSnapshot.basePrice, currency: 'ETB' }, customization);
        // Build immutable tailor snapshot
        const tailorSnapshot = {
            tailorId: String(tailorId),
            businessName: req.body.tailorName || 'Royal Habesha Couture',
            businessAddress: req.body.tailorAddress || 'Bole Medhanealem, Addis Ababa',
        };
        // Build immutable customer snapshot
        const customerSnapshot = {
            customerId: String(customerId),
            name: req.body.customerName || 'Abebe Bikila',
            email: req.body.customerEmail || 'abebe.b@example.com',
        };
        // Build immutable measurement snapshot
        const measurementSnapshot = measurementProfile.measurements || {
            chest: { value: 104, unit: 'cm', measuredAt: new Date().toISOString() },
            waist: { value: 84, unit: 'cm', measuredAt: new Date().toISOString() },
            shoulder: { value: 46, unit: 'cm', measuredAt: new Date().toISOString() },
            sleeveLength: { value: 65, unit: 'cm', measuredAt: new Date().toISOString() },
            height: { value: 182, unit: 'cm', measuredAt: new Date().toISOString() },
        };
        // Build payment snapshot
        const paymentInfo = {
            status: 'PENDING',
            paymentMethod,
            amountPaid: pricingSnapshot.totalCalculatedPrice * quantity,
        };
        // Build delivery info snapshot
        const fullDeliveryInfo = {
            recipientName: deliveryInfo.recipientName || customerSnapshot.name,
            address: deliveryInfo.address || 'Kazanchis Residence Tower, Apt 7B, Addis Ababa',
            contactPhone: deliveryInfo.contactPhone || '+251 91 123 4567',
            deliveryNotes: deliveryInfo.deliveryNotes || 'Deliver to front desk reception',
        };
        const orderId = generateOrderId();
        const initialStatus = 'PENDING_PAYMENT';
        const initialHistoryRecord = {
            historyId: `hist-${Date.now()}-1`,
            orderId,
            previousStatus: 'NONE',
            newStatus: initialStatus,
            actor: {
                userId: String(customerId),
                role: 'CUSTOMER',
                name: customerSnapshot.name,
            },
            timestamp: new Date(),
            notes: 'Order created with locked pricing and body measurement snapshot.',
        };
        try {
            const newOrder = await Order_1.Order.create({
                orderId,
                customerId: String(customerId),
                tailorId: String(tailorId),
                productId: String(productId),
                quantity,
                customerSnapshot,
                tailorSnapshot,
                productSnapshot,
                customization,
                measurementSnapshot,
                pricingSnapshot,
                paymentInfo,
                deliveryInfo: fullDeliveryInfo,
                status: initialStatus,
                statusHistory: [initialHistoryRecord],
            });
            return res.status(201).json({
                message: 'Order created successfully with immutable snapshots!',
                order: newOrder,
            });
        }
        catch (dbErr) {
            // Memory fallback if DB query fails or unconfigured
            const memoryOrder = {
                orderId,
                customerId: String(customerId),
                tailorId: String(tailorId),
                productId: String(productId),
                quantity,
                customerSnapshot,
                tailorSnapshot,
                productSnapshot,
                customization,
                measurementSnapshot,
                pricingSnapshot,
                paymentInfo,
                deliveryInfo: fullDeliveryInfo,
                status: initialStatus,
                statusHistory: [initialHistoryRecord],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            memoryOrders.unshift(memoryOrder);
            return res.status(201).json({
                message: 'Order created successfully (local mode)',
                order: memoryOrder,
            });
        }
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to create order' });
    }
});
/**
 * GET /api/orders
 * List orders with optional role/customer/tailor filter.
 */
router.get('/', async (req, res) => {
    try {
        const { customerId, tailorId, status } = req.query;
        const filter = {};
        if (customerId)
            filter.customerId = String(customerId);
        if (tailorId)
            filter.tailorId = String(tailorId);
        if (status)
            filter.status = String(status);
        const dbOrders = await Order_1.Order.find(filter).sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length > 0) {
            return res.json({ orders: dbOrders });
        }
    }
    catch (err) {
        // Fallback to memory orders
    }
    // Provide realistic initial mock orders if database is empty
    if (memoryOrders.length === 0) {
        memoryOrders = [
            {
                orderId: 'ORD-2026-9001',
                customerId: 'cust-101',
                tailorId: '1',
                productId: '1',
                quantity: 1,
                customerSnapshot: { customerId: 'cust-101', name: 'Abebe Bikila', email: 'abebe.b@example.com' },
                tailorSnapshot: { tailorId: '1', businessName: 'Royal Habesha Couture', businessAddress: 'Bole Medhanealem, Addis Ababa' },
                productSnapshot: { productId: '1', name: 'Custom Three-Piece Tuxedo', categoryName: 'Suit', image: '/sample_custom_tuxedo.jpg', basePrice: 12500 },
                customization: { fabric: 'Italian Pure Wool', lining: 'Paisley Silk', buttons: 'Horn Buttons', embroidery: 'Gold Monogram' },
                measurementSnapshot: { chest: { value: 104, unit: 'cm' }, waist: { value: 84, unit: 'cm' }, shoulder: { value: 46, unit: 'cm' }, height: { value: 182, unit: 'cm' } },
                pricingSnapshot: { basePrice: 12500, lineItems: [{ groupName: 'FABRIC', choiceName: 'Italian Pure Wool', priceModifier: 2500 }, { groupName: 'LINING', choiceName: 'Paisley Silk', priceModifier: 1500 }], customizationModifiersTotal: 4000, totalCalculatedPrice: 16500, currency: 'ETB' },
                paymentInfo: { status: 'PAID', paymentMethod: 'TELEBIRR', amountPaid: 16500 },
                deliveryInfo: { recipientName: 'Abebe Bikila', address: 'Kazanchis Residence Tower, Apt 7B', contactPhone: '+251 91 123 4567' },
                status: 'IN_PRODUCTION',
                statusHistory: [
                    { historyId: 'h-1', orderId: 'ORD-2026-9001', previousStatus: 'NONE', newStatus: 'PENDING_PAYMENT', actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' }, timestamp: new Date(Date.now() - 86400000 * 2), notes: 'Order placed' },
                    { historyId: 'h-2', orderId: 'ORD-2026-9001', previousStatus: 'PENDING_PAYMENT', newStatus: 'PAID', actor: { userId: 'cust-101', role: 'CUSTOMER', name: 'Abebe Bikila' }, timestamp: new Date(Date.now() - 86400000 * 2 + 1800000), notes: 'Payment confirmed via Telebirr' },
                    { historyId: 'h-3', orderId: 'ORD-2026-9001', previousStatus: 'PAID', newStatus: 'PENDING_TAILOR', actor: { userId: 'system', role: 'SYSTEM', name: 'Order Engine' }, timestamp: new Date(Date.now() - 86400000 * 2 + 1805000), notes: 'Transferred to tailor workspace' },
                    { historyId: 'h-4', orderId: 'ORD-2026-9001', previousStatus: 'PENDING_TAILOR', newStatus: 'ACCEPTED', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: new Date(Date.now() - 86400000 * 1), notes: 'Tailor accepted order & assigned lead cutter' },
                    { historyId: 'h-5', orderId: 'ORD-2026-9001', previousStatus: 'ACCEPTED', newStatus: 'MEASUREMENT_VERIFICATION', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: new Date(Date.now() - 43200000), notes: 'Measurements verified against pattern parameters' },
                    { historyId: 'h-6', orderId: 'ORD-2026-9001', previousStatus: 'MEASUREMENT_VERIFICATION', newStatus: 'IN_PRODUCTION', actor: { userId: 'tailor-1', role: 'TAILOR', name: 'Royal Habesha Couture' }, timestamp: new Date(Date.now() - 21600000), notes: 'Fabric cutting completed, entering sewing assembly phase' },
                ],
                createdAt: new Date(Date.now() - 86400000 * 2),
                updatedAt: new Date(Date.now() - 21600000),
            },
        ];
    }
    return res.json({ orders: memoryOrders });
});
/**
 * GET /api/orders/:id
 * Fetch single order with status history.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const dbOrder = await Order_1.Order.findOne({ $or: [{ orderId: id }, { _id: id }] });
        if (dbOrder) {
            return res.json({ order: dbOrder });
        }
    }
    catch (err) {
        // Fallback to memory
    }
    const memOrder = memoryOrders.find((o) => o.orderId === id || String(o._id) === id);
    if (memOrder) {
        return res.json({ order: memOrder });
    }
    return res.status(404).json({ error: `Order '${id}' not found` });
});
/**
 * PATCH /api/orders/:id/status
 * Perform validated state transition and record status history record.
 */
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { newStatus, actorRole = 'TAILOR', actorName = 'User', actorId = 'user-1', notes } = req.body;
    if (!newStatus) {
        return res.status(400).json({ error: 'Missing required parameter: newStatus' });
    }
    let orderObj = null;
    let isDb = false;
    try {
        orderObj = await Order_1.Order.findOne({ $or: [{ orderId: id }, { _id: id }] });
        if (orderObj)
            isDb = true;
    }
    catch (err) {
        // memory fallback
    }
    if (!orderObj) {
        orderObj = memoryOrders.find((o) => o.orderId === id || String(o._id) === id);
    }
    if (!orderObj) {
        return res.status(404).json({ error: `Order '${id}' not found` });
    }
    const currentStatus = orderObj.status;
    const targetStatus = newStatus;
    // Validate state transition & actor permissions
    const validation = (0, orderStateMachine_1.validateStatusTransition)(currentStatus, targetStatus, actorRole);
    if (!validation.isValid) {
        return res.status(400).json({
            error: 'Invalid state transition',
            details: validation.reason,
            currentStatus,
            attemptedStatus: targetStatus,
        });
    }
    const historyRecord = {
        historyId: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: orderObj.orderId,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        actor: {
            userId: String(actorId),
            role: String(actorRole).toUpperCase(),
            name: String(actorName),
        },
        timestamp: new Date(),
        notes: notes || `Transitioned from ${currentStatus} to ${targetStatus}`,
    };
    orderObj.status = targetStatus;
    if (!orderObj.statusHistory)
        orderObj.statusHistory = [];
    orderObj.statusHistory.push(historyRecord);
    // Update payment status if transitioning to PAID
    if (targetStatus === 'PAID' && orderObj.paymentInfo) {
        orderObj.paymentInfo.status = 'PAID';
    }
    return res.json({
        message: `Order status successfully updated to '${targetStatus}'`,
        order: orderObj,
        historyRecord,
    });
});
/**
 * PATCH /api/orders/:id/production-stage
 * Advance tailor production workflow stage (ORDER_ACCEPTED -> MEASUREMENT_VERIFIED -> CUTTING -> SEWING -> FINISHING -> QUALITY_CHECK -> READY).
 */
router.patch('/:id/production-stage', async (req, res) => {
    const { id } = req.params;
    const { productionStage, notes, actorName = 'Tailor Workshop', actorId = 'tailor-1' } = req.body;
    if (!productionStage) {
        return res.status(400).json({ error: 'Missing required parameter: productionStage' });
    }
    let orderObj = null;
    let isDb = false;
    try {
        orderObj = await Order_1.Order.findOne({ $or: [{ orderId: id }, { _id: id }] });
        if (orderObj)
            isDb = true;
    }
    catch (err) {
        // memory fallback
    }
    if (!orderObj) {
        orderObj = memoryOrders.find((o) => o.orderId === id || String(o._id) === id);
    }
    if (!orderObj) {
        return res.status(404).json({ error: `Order '${id}' not found` });
    }
    const currentStage = orderObj.productionStage || 'ORDER_ACCEPTED';
    const validation = (0, orderStateMachine_1.validateProductionStageTransition)(currentStage, productionStage);
    if (!validation.isValid) {
        return res.status(400).json({ error: 'Invalid production stage transition', details: validation.reason });
    }
    const progressPercent = (0, orderStateMachine_1.getProductionStageProgress)(productionStage);
    orderObj.productionStage = productionStage;
    orderObj.productionProgressPercent = progressPercent;
    orderObj.productionNotes = notes || `Production stage advanced to ${productionStage} (${progressPercent}%)`;
    // Synchronize overall order status depending on stage
    let syncStatus = orderObj.status;
    if (productionStage === 'MEASUREMENT_VERIFIED')
        syncStatus = 'MEASUREMENT_VERIFICATION';
    else if (productionStage === 'CUTTING' || productionStage === 'SEWING' || productionStage === 'FINISHING')
        syncStatus = 'IN_PRODUCTION';
    else if (productionStage === 'QUALITY_CHECK')
        syncStatus = 'QUALITY_CHECK';
    else if (productionStage === 'READY')
        syncStatus = 'READY_FOR_PICKUP';
    const historyRecord = {
        historyId: `hist-prod-${Date.now()}`,
        orderId: orderObj.orderId,
        previousStatus: orderObj.status,
        newStatus: syncStatus,
        actor: { userId: String(actorId), role: 'TAILOR', name: String(actorName) },
        timestamp: new Date(),
        notes: `Tailor Production Step: ${productionStage} (${progressPercent}%) - ${notes || 'Stage updated'}`,
    };
    orderObj.status = syncStatus;
    if (!orderObj.statusHistory)
        orderObj.statusHistory = [];
    orderObj.statusHistory.push(historyRecord);
    if (isDb) {
        await orderObj.save();
    }
    return res.json({
        message: `Production stage updated to '${productionStage}' (${progressPercent}%)`,
        order: orderObj,
        historyRecord,
    });
});
exports.default = router;
