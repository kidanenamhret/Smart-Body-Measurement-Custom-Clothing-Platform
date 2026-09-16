"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const deliveryAuth_1 = require("../middleware/deliveryAuth");
const DeliveryAgent_1 = require("../models/DeliveryAgent");
const Delivery_1 = require("../models/Delivery");
const Order_1 = require("../models/Order");
const Notification_1 = require("../models/Notification");
const router = (0, express_1.Router)();
// All delivery endpoints require authentication
router.use(auth_1.authenticateToken);
// =========================================================================
// 1. PROFILE & AVAILABILITY
// =========================================================================
/**
 * POST /api/delivery/profile
 * Create the delivery agent profile.
 */
router.post('/profile', deliveryAuth_1.requireDeliveryAgentRole, async (req, res) => {
    try {
        const userId = req.user.sub;
        const existing = await DeliveryAgent_1.DeliveryAgent.findOne({ userId });
        if (existing) {
            return res.status(409).json({ message: 'Delivery agent profile already exists.' });
        }
        const { phone, vehicleType, licensePlate } = req.body;
        const agent = new DeliveryAgent_1.DeliveryAgent({
            userId,
            phone,
            vehicleType: vehicleType || 'Motorcycle',
            licensePlate,
            status: 'AVAILABLE',
        });
        await agent.save();
        return res.status(201).json({ message: 'Delivery agent profile created successfully', agent });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating profile', error: error.message });
    }
});
/**
 * GET /api/delivery/profile
 * Retrieve profile, status, vehicle, and completed deliveries count.
 */
router.get('/profile', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    return res.json({ agent: req.deliveryAgent });
});
/**
 * PATCH /api/delivery/availability
 * Update agent availability status ('AVAILABLE', 'ON_DELIVERY', 'OFFLINE').
 */
router.patch('/availability', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['AVAILABLE', 'ON_DELIVERY', 'OFFLINE'].includes(status)) {
            return res.status(400).json({ message: 'Status must be AVAILABLE, ON_DELIVERY, or OFFLINE.' });
        }
        const agent = req.deliveryAgent;
        agent.status = status;
        await agent.save();
        return res.json({ message: 'Availability status updated', status: agent.status });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating status', error: error.message });
    }
});
/**
 * PATCH /api/delivery/location
 * Broadcast real-time GPS coordinates for active route tracking.
 */
router.patch('/location', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'lat and lng coordinates are required.' });
        }
        const agent = req.deliveryAgent;
        agent.currentLocation = {
            lat: Number(lat),
            lng: Number(lng),
            lastUpdated: new Date(),
        };
        await agent.save();
        return res.json({ message: 'Location updated', currentLocation: agent.currentLocation });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating location', error: error.message });
    }
});
// =========================================================================
// 2. JOB BOARD & ASSIGNMENTS
// =========================================================================
/**
 * GET /api/delivery/jobs/available
 * View open delivery jobs awaiting an agent pickup.
 */
router.get('/jobs/available', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const jobs = await Delivery_1.Delivery.find({ status: 'AVAILABLE' })
            .populate('orderId', 'totalAmount currency items')
            .populate('tailorId', 'businessName businessAddress phone')
            .sort({ createdAt: -1 });
        return res.json({ count: jobs.length, jobs });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching available jobs', error: error.message });
    }
});
/**
 * GET /api/delivery/jobs/assigned
 * View active deliveries currently assigned to this agent.
 */
router.get('/jobs/assigned', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const jobs = await Delivery_1.Delivery.find({
            deliveryAgentId: req.deliveryAgent._id,
            status: { $in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'PICKED_UP', 'EN_ROUTE_TO_CUSTOMER'] },
        })
            .populate('orderId', 'totalAmount currency items')
            .sort({ updatedAt: -1 });
        return res.json({ activeCount: jobs.length, jobs });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching assigned jobs', error: error.message });
    }
});
/**
 * POST /api/delivery/jobs/:id/accept
 * Accept / claim a delivery job.
 */
router.post('/jobs/:id/accept', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const delivery = await Delivery_1.Delivery.findById(req.params.id);
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery job not found.' });
        }
        if (delivery.status !== 'AVAILABLE' && delivery.status !== 'ASSIGNED') {
            return res.status(400).json({
                message: `Job cannot be accepted; current status is ${delivery.status}.`,
            });
        }
        delivery.deliveryAgentId = req.deliveryAgent._id;
        delivery.status = 'ACCEPTED';
        delivery.trackingHistory.push({
            status: 'ACCEPTED',
            timestamp: new Date(),
            note: `Job accepted by agent ${req.user.name}`,
        });
        await delivery.save();
        // Mark agent status as on delivery
        req.deliveryAgent.status = 'ON_DELIVERY';
        await req.deliveryAgent.save();
        return res.json({
            message: 'Delivery job accepted successfully',
            jobId: delivery._id,
            status: delivery.status,
            pickupInfo: delivery.pickupInfo,
            deliveryInfo: delivery.deliveryInfo,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error accepting job', error: error.message });
    }
});
// =========================================================================
// 3. JOB DETAILS & NAVIGATION INFO
// =========================================================================
/**
 * GET /api/delivery/jobs/:id
 * View full job details with pickup info (tailor workshop) and delivery info (customer destination).
 */
router.get('/jobs/:id', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const delivery = await Delivery_1.Delivery.findOne({
            _id: req.params.id,
            $or: [
                { deliveryAgentId: req.deliveryAgent._id },
                { status: 'AVAILABLE' }, // allow previewing open jobs
            ],
        }).populate('orderId', 'totalAmount currency items createdAt');
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery job not found or not assigned to you.' });
        }
        return res.json({
            jobId: delivery._id,
            status: delivery.status,
            order: delivery.orderId,
            pickupInfo: delivery.pickupInfo,
            deliveryInfo: delivery.deliveryInfo,
            pickupConfirmedAt: delivery.pickupConfirmedAt,
            deliveryConfirmedAt: delivery.deliveryConfirmedAt,
            trackingHistory: delivery.trackingHistory,
            proofOfDelivery: delivery.proofOfDelivery,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching job details', error: error.message });
    }
});
// =========================================================================
// 4. TRANSIT STATUS & CONFIRMATIONS
// =========================================================================
/**
 * PATCH /api/delivery/jobs/:id/status
 * Update delivery transit status ('EN_ROUTE_TO_PICKUP' or 'EN_ROUTE_TO_CUSTOMER').
 */
router.patch('/jobs/:id/status', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { status, note, location } = req.body;
        const allowedStatuses = ['EN_ROUTE_TO_PICKUP', 'EN_ROUTE_TO_CUSTOMER'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${allowedStatuses.join(', ')}. Use dedicated confirm endpoints for pickup/delivery.`,
            });
        }
        const delivery = await Delivery_1.Delivery.findOne({
            _id: req.params.id,
            deliveryAgentId: req.deliveryAgent._id,
        });
        if (!delivery) {
            return res.status(404).json({ message: 'Assigned delivery job not found.' });
        }
        delivery.status = status;
        delivery.trackingHistory.push({
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status}`,
            location,
        });
        await delivery.save();
        return res.json({ message: 'Transit status updated', status: delivery.status });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating delivery status', error: error.message });
    }
});
/**
 * POST /api/delivery/jobs/:id/confirm-pickup
 * Confirm garment pickup from the tailor workshop.
 */
router.post('/jobs/:id/confirm-pickup', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { note, location } = req.body;
        const delivery = await Delivery_1.Delivery.findOne({
            _id: req.params.id,
            deliveryAgentId: req.deliveryAgent._id,
        });
        if (!delivery) {
            return res.status(404).json({ message: 'Assigned delivery job not found.' });
        }
        delivery.status = 'PICKED_UP';
        delivery.pickupConfirmedAt = new Date();
        delivery.trackingHistory.push({
            status: 'PICKED_UP',
            timestamp: new Date(),
            note: note || 'Garment collected from tailor workshop.',
            location,
        });
        await delivery.save();
        // Update order status
        await Order_1.Order.findByIdAndUpdate(delivery.orderId, {
            status: 'PICKED_UP',
            $push: {
                statusHistory: {
                    status: 'PICKED_UP',
                    changedAt: new Date(),
                    note: 'Package picked up by delivery agent.',
                },
            },
        });
        // Notify customer
        await Notification_1.Notification.create({
            recipientId: delivery.customerId,
            recipientRole: 'CUSTOMER',
            title: 'Package Picked Up',
            message: 'Your custom order has been picked up from the tailor and is on its way!',
            type: 'DELIVERY_UPDATE',
            data: { orderId: delivery.orderId, deliveryId: delivery._id },
        });
        return res.json({
            message: 'Pickup confirmed successfully',
            status: delivery.status,
            pickupConfirmedAt: delivery.pickupConfirmedAt,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error confirming pickup', error: error.message });
    }
});
/**
 * POST /api/delivery/jobs/:id/confirm-delivery
 * Confirm successful final delivery to customer.
 */
router.post('/jobs/:id/confirm-delivery', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { recipientName, notes, photoUrl, signatureUrl, location } = req.body;
        const delivery = await Delivery_1.Delivery.findOne({
            _id: req.params.id,
            deliveryAgentId: req.deliveryAgent._id,
        });
        if (!delivery) {
            return res.status(404).json({ message: 'Assigned delivery job not found.' });
        }
        delivery.status = 'DELIVERED';
        delivery.deliveryConfirmedAt = new Date();
        delivery.proofOfDelivery = {
            recipientName: recipientName || delivery.deliveryInfo.recipientName,
            notes: notes || 'Delivered directly to recipient.',
            photoUrl,
            signatureUrl,
        };
        delivery.trackingHistory.push({
            status: 'DELIVERED',
            timestamp: new Date(),
            note: `Delivered to ${delivery.proofOfDelivery.recipientName}`,
            location,
        });
        await delivery.save();
        // Mark associated order as COMPLETED
        await Order_1.Order.findByIdAndUpdate(delivery.orderId, {
            status: 'COMPLETED',
            $push: {
                statusHistory: {
                    status: 'COMPLETED',
                    changedAt: new Date(),
                    note: 'Package delivered and signed for by customer.',
                },
            },
        });
        // Increment agent's completed delivery counter and free status
        const agent = req.deliveryAgent;
        agent.completedDeliveriesCount = (agent.completedDeliveriesCount || 0) + 1;
        agent.status = 'AVAILABLE';
        await agent.save();
        // Notify customer
        await Notification_1.Notification.create({
            recipientId: delivery.customerId,
            recipientRole: 'CUSTOMER',
            title: 'Order Delivered!',
            message: 'Your custom garments have arrived! Please try them on and leave a review for your tailor.',
            type: 'ORDER_DELIVERED',
            data: { orderId: delivery.orderId, deliveryId: delivery._id },
        });
        return res.json({
            message: 'Delivery confirmed successfully',
            status: delivery.status,
            deliveryConfirmedAt: delivery.deliveryConfirmedAt,
            completedDeliveriesCount: agent.completedDeliveriesCount,
            proofOfDelivery: delivery.proofOfDelivery,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error confirming delivery', error: error.message });
    }
});
// =========================================================================
// 5. DELIVERY HISTORY
// =========================================================================
/**
 * GET /api/delivery/history
 * Maintain and browse delivery history of completed / past deliveries.
 */
router.get('/history', deliveryAuth_1.requireDeliveryAgentProfile, async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const query = { deliveryAgentId: req.deliveryAgent._id };
        if (status) {
            query.status = status;
        }
        else {
            query.status = { $in: ['DELIVERED', 'FAILED', 'CANCELLED'] };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const deliveries = await Delivery_1.Delivery.find(query)
            .populate('orderId', 'totalAmount currency items')
            .populate('tailorId', 'businessName')
            .sort({ deliveryConfirmedAt: -1, updatedAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Delivery_1.Delivery.countDocuments(query);
        return res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            deliveries,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching delivery history', error: error.message });
    }
});
exports.default = router;
