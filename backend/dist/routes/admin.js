"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const User_1 = require("../models/User");
const Customer_1 = require("../models/Customer");
const Tailor_1 = require("../models/Tailor");
const DeliveryAgent_1 = require("../models/DeliveryAgent");
const ClothingCategory_1 = require("../models/ClothingCategory");
const ClothingProduct_1 = require("../models/ClothingProduct");
const Order_1 = require("../models/Order");
const Delivery_1 = require("../models/Delivery");
const Payment_1 = require("../models/Payment");
const SupportTicket_1 = require("../models/SupportTicket");
const AuditLog_1 = require("../models/AuditLog");
const SystemSetting_1 = require("../models/SystemSetting");
const router = (0, express_1.Router)();
// All admin routes require authentication and ADMIN role
router.use(auth_1.authenticateToken);
router.use(adminAuth_1.requireAdmin);
// =========================================================================
// 1. DASHBOARD & REPORTS
// =========================================================================
/**
 * GET /api/admin/dashboard
 * Summary KPIs and live operational counts from real database data.
 */
router.get('/dashboard', async (_req, res) => {
    try {
        const [totalUsers, customers, tailors, verifiedTailors, pendingVerifications, totalDeliveryAgents, totalOrders, activeOrders, completedOrdersCount, cancelledOrders, completedOrdersDocs, totalPayments, successfulPayments, totalDeliveries, activeDeliveries, completedDeliveries, totalTickets, openTickets, resolvedTickets,] = await Promise.all([
            User_1.User.countDocuments(),
            Customer_1.Customer.countDocuments(),
            Tailor_1.Tailor.countDocuments(),
            Tailor_1.Tailor.countDocuments({ verificationStatus: 'VERIFIED' }),
            Tailor_1.Tailor.countDocuments({ verificationStatus: 'PENDING' }),
            DeliveryAgent_1.DeliveryAgent.countDocuments(),
            Order_1.Order.countDocuments(),
            Order_1.Order.countDocuments({ status: { $in: ['ACCEPTED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'MEASUREMENT_VERIFICATION'] } }),
            Order_1.Order.countDocuments({ status: { $in: ['COMPLETED', 'DELIVERED'] } }),
            Order_1.Order.countDocuments({ status: { $in: ['CANCELLED', 'REJECTED'] } }),
            Order_1.Order.find({ status: { $in: ['COMPLETED', 'DELIVERED'] } }).select('totalAmount pricingSnapshot'),
            Payment_1.Payment.countDocuments(),
            Payment_1.Payment.countDocuments({ status: 'SUCCESS' }),
            Delivery_1.Delivery.countDocuments(),
            Delivery_1.Delivery.countDocuments({ status: { $in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } }),
            Delivery_1.Delivery.countDocuments({ status: 'DELIVERED' }),
            SupportTicket_1.SupportTicket.countDocuments(),
            SupportTicket_1.SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
            SupportTicket_1.SupportTicket.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } }),
        ]);
        const totalRevenue = completedOrdersDocs.reduce((sum, order) => sum + (order.totalAmount || order.pricingSnapshot?.totalCalculatedPrice || 0), 0);
        return res.json({
            metrics: {
                totalUsers,
                customers,
                tailors,
                verifiedTailors,
                pendingVerifications,
                totalDeliveryAgents,
                orders: totalOrders,
                activeOrders,
                completedOrders: completedOrdersCount,
                cancelledOrders,
                payments: {
                    totalVolume: totalRevenue,
                    totalTransactions: totalPayments,
                    successfulPayments,
                },
                deliveries: {
                    total: totalDeliveries,
                    active: activeDeliveries,
                    completed: completedDeliveries,
                },
                supportTickets: {
                    total: totalTickets,
                    open: openTickets,
                    resolved: resolvedTickets,
                },
                totalCustomers: customers,
                totalTailors: tailors,
                pendingTailorVerifications: pendingVerifications,
                totalPlatformRevenue: totalRevenue,
                openSupportTickets: openTickets,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error loading dashboard', error: error.message });
    }
});
/**
 * GET /api/admin/reports
 * Aggregated analytics for orders, revenue, and tailor growth.
 */
router.get('/reports', async (_req, res) => {
    try {
        const ordersByStatus = await Order_1.Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, totalVolume: { $sum: '$totalAmount' } } },
        ]);
        const usersByRole = await User_1.User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        const ticketsByType = await SupportTicket_1.SupportTicket.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]);
        return res.json({
            ordersByStatus,
            usersByRole,
            ticketsByType,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error compiling reports', error: error.message });
    }
});
// =========================================================================
// 2. USER & CUSTOMER MANAGEMENT
// =========================================================================
/**
 * GET /api/admin/users
 * Browse all platform users with role/status filters.
 */
router.get('/users', async (req, res) => {
    try {
        const { role, isActive, search, limit = 20, page = 1 } = req.query;
        const query = {};
        if (role)
            query.role = role;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const users = await User_1.User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User_1.User.countDocuments(query);
        return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), users });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});
/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend or unsuspend user account.
 */
router.patch('/users/:id/suspend', async (req, res) => {
    try {
        const { suspend, reason } = req.body;
        const user = await User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.isActive = !suspend;
        await user.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER', 'User', user._id, { email: user.email, reason }, req);
        return res.json({
            message: `User ${user.isActive ? 'activated' : 'suspended'} successfully.`,
            isActive: user.isActive,
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
});
/**
 * GET /api/admin/customers
 * List customers.
 */
router.get('/customers', async (_req, res) => {
    try {
        const customers = await Customer_1.Customer.find()
            .populate('userId', 'name email phone isActive createdAt')
            .sort({ createdAt: -1 });
        return res.json({ customers });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});
// =========================================================================
// 3. TAILOR GOVERNANCE (VERIFY, REJECT, SUSPEND)
// =========================================================================
/**
 * GET /api/admin/tailors
 * List tailors with verificationStatus filters.
 */
router.get('/tailors', async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status)
            query.verificationStatus = status;
        const tailors = await Tailor_1.Tailor.find(query)
            .populate('userId', 'name email phone isActive')
            .sort({ createdAt: -1 });
        return res.json({ tailors });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching tailors', error: error.message });
    }
});
/**
 * POST /api/admin/tailors/:id/verify
 * Approve tailor application and grant verified status.
 */
router.post('/tailors/:id/verify', async (req, res) => {
    try {
        const tailor = await Tailor_1.Tailor.findById(req.params.id);
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        tailor.verificationStatus = 'VERIFIED';
        await tailor.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'VERIFY_TAILOR', 'Tailor', tailor._id, { businessName: tailor.businessName }, req);
        return res.json({ message: 'Tailor verified successfully', tailor });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error verifying tailor', error: error.message });
    }
});
/**
 * POST /api/admin/tailors/:id/reject
 * Reject tailor application with note.
 */
router.post('/tailors/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        const tailor = await Tailor_1.Tailor.findById(req.params.id);
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        tailor.verificationStatus = 'REJECTED';
        await tailor.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'REJECT_TAILOR', 'Tailor', tailor._id, { reason }, req);
        return res.json({ message: 'Tailor application rejected', status: tailor.verificationStatus, reason });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error rejecting tailor', error: error.message });
    }
});
/**
 * PATCH /api/admin/tailors/:id/status
 * Suspend or change tailor business status.
 */
router.patch('/tailors/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        if (!['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid verificationStatus' });
        }
        const tailor = await Tailor_1.Tailor.findById(req.params.id);
        if (!tailor) {
            return res.status(404).json({ message: 'Tailor not found.' });
        }
        tailor.verificationStatus = status;
        await tailor.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'UPDATE_TAILOR_STATUS', 'Tailor', tailor._id, { status, reason }, req);
        return res.json({ message: `Tailor status updated to ${status}`, tailor });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating tailor status', error: error.message });
    }
});
// =========================================================================
// 4. DELIVERY AGENT MANAGEMENT
// =========================================================================
/**
 * GET /api/admin/delivery-agents
 * List delivery agents.
 */
router.get('/delivery-agents', async (_req, res) => {
    try {
        const agents = await DeliveryAgent_1.DeliveryAgent.find()
            .populate('userId', 'name email phone isActive')
            .sort({ createdAt: -1 });
        return res.json({ agents });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching delivery agents', error: error.message });
    }
});
// =========================================================================
// 5. CLOTHING CATEGORIES & PRODUCTS
// =========================================================================
/**
 * GET /api/admin/categories
 */
router.get('/categories', async (_req, res) => {
    try {
        const categories = await ClothingCategory_1.ClothingCategory.find().sort({ name: 1 });
        return res.json({ categories });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});
/**
 * POST /api/admin/categories
 */
router.post('/categories', async (req, res) => {
    try {
        const { name, description, image } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const category = new ClothingCategory_1.ClothingCategory({ name, description, image });
        await category.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'CREATE_CATEGORY', 'ClothingCategory', category._id, { name }, req);
        return res.status(201).json({ message: 'Category created', category });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});
/**
 * PUT /api/admin/categories/:id
 */
router.put('/categories/:id', async (req, res) => {
    try {
        const category = await ClothingCategory_1.ClothingCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'UPDATE_CATEGORY', 'ClothingCategory', category._id, req.body, req);
        return res.json({ message: 'Category updated', category });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating category', error: error.message });
    }
});
/**
 * DELETE /api/admin/categories/:id
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await ClothingCategory_1.ClothingCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'DELETE_CATEGORY', 'ClothingCategory', category._id, { name: category.name }, req);
        return res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});
/**
 * GET /api/admin/products
 */
router.get('/products', async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const query = {};
        if (status)
            query.availabilityStatus = status;
        const skip = (Number(page) - 1) * Number(limit);
        const products = await ClothingProduct_1.ClothingProduct.find(query)
            .populate('tailorId', 'businessName')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await ClothingProduct_1.ClothingProduct.countDocuments(query);
        return res.json({ total, page: Number(page), products });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});
/**
 * PATCH /api/admin/products/:id/status
 */
router.patch('/products/:id/status', async (req, res) => {
    try {
        const { availabilityStatus } = req.body;
        const product = await ClothingProduct_1.ClothingProduct.findByIdAndUpdate(req.params.id, { availabilityStatus }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'UPDATE_PRODUCT_STATUS', 'ClothingProduct', product._id, { availabilityStatus }, req);
        return res.json({ message: 'Product status updated', product });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating product status', error: error.message });
    }
});
// =========================================================================
// 6. MONITORING (ORDERS, PAYMENTS, DELIVERIES)
// =========================================================================
/**
 * GET /api/admin/orders
 * Monitor all platform orders.
 */
router.get('/orders', async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const orders = await Order_1.Order.find(query)
            .populate('customerId', 'name')
            .populate('tailorId', 'businessName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Order_1.Order.countDocuments(query);
        return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), orders });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});
/**
 * GET /api/admin/payments
 * Monitor platform transactions.
 */
router.get('/payments', async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const payments = await Payment_1.Payment.find(query)
            .populate('orderId', 'totalAmount currency status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Payment_1.Payment.countDocuments(query);
        return res.json({ total, page: Number(page), payments });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});
/**
 * GET /api/admin/deliveries
 * Monitor transit and delivery status.
 */
router.get('/deliveries', async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const deliveries = await Delivery_1.Delivery.find(query)
            .populate('deliveryAgentId', 'phone vehicleType')
            .populate('orderId', 'totalAmount currency')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Delivery_1.Delivery.countDocuments(query);
        return res.json({ total, page: Number(page), deliveries });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
    }
});
// =========================================================================
// 7. COMPLAINTS & SUPPORT TICKETS
// =========================================================================
/**
 * GET /api/admin/tickets
 * List customer and tailor complaints/tickets.
 */
router.get('/tickets', async (req, res) => {
    try {
        const { status, priority, type } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (type)
            query.type = type;
        const tickets = await SupportTicket_1.SupportTicket.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });
        return res.json({ count: tickets.length, tickets });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching support tickets', error: error.message });
    }
});
/**
 * GET /api/admin/tickets/:id
 */
router.get('/tickets/:id', async (req, res) => {
    try {
        const ticket = await SupportTicket_1.SupportTicket.findById(req.params.id).populate('userId', 'name email role');
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        return res.json({ ticket });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching ticket', error: error.message });
    }
});
/**
 * POST /api/admin/tickets/:id/reply
 * Reply to support ticket or customer complaint.
 */
router.post('/tickets/:id/reply', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message content is required.' });
        }
        const ticket = await SupportTicket_1.SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        ticket.messages.push({
            senderId: req.user.sub,
            senderRole: 'ADMIN',
            senderName: req.user.name || 'SEWFIT Support Admin',
            message,
            createdAt: new Date(),
        });
        ticket.status = 'IN_PROGRESS';
        await ticket.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'REPLY_TICKET', 'SupportTicket', ticket._id, { ticketNumber: ticket.ticketNumber }, req);
        return res.json({ message: 'Reply sent successfully', ticket });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error replying to ticket', error: error.message });
    }
});
/**
 * PATCH /api/admin/tickets/:id/status
 * Resolve or close ticket.
 */
router.patch('/tickets/:id/status', async (req, res) => {
    try {
        const { status, resolutionNotes } = req.body;
        if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const ticket = await SupportTicket_1.SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        ticket.status = status;
        if (resolutionNotes)
            ticket.resolutionNotes = resolutionNotes;
        await ticket.save();
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'UPDATE_TICKET_STATUS', 'SupportTicket', ticket._id, { status, resolutionNotes }, req);
        return res.json({ message: `Ticket updated to ${status}`, ticket });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating ticket status', error: error.message });
    }
});
// =========================================================================
// 8. AUDIT LOGS & SYSTEM SETTINGS
// =========================================================================
/**
 * GET /api/admin/audit-logs
 * Review security and governance logs.
 */
router.get('/audit-logs', async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const logs = await AuditLog_1.AuditLog.find()
            .sort({ timestamp: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await AuditLog_1.AuditLog.countDocuments();
        return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), logs });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
    }
});
/**
 * GET /api/admin/settings
 * List platform settings.
 */
router.get('/settings', async (_req, res) => {
    try {
        const settings = await SystemSetting_1.SystemSetting.find().sort({ category: 1, key: 1 });
        return res.json({ settings });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error fetching system settings', error: error.message });
    }
});
/**
 * PUT /api/admin/settings/:key
 * Update system setting value.
 */
router.put('/settings/:key', async (req, res) => {
    try {
        const { value, description, category } = req.body;
        const setting = await SystemSetting_1.SystemSetting.findOneAndUpdate({ key: req.params.key }, {
            value,
            description,
            category: category || 'GENERAL',
            updatedBy: req.user.sub,
        }, { upsert: true, new: true });
        await (0, adminAuth_1.logAdminAction)(req.user.sub, 'UPDATE_SYSTEM_SETTING', 'SystemSetting', setting._id, { key: setting.key, value }, req);
        return res.json({ message: 'Setting updated successfully', setting });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error updating system setting', error: error.message });
    }
});
exports.default = router;
