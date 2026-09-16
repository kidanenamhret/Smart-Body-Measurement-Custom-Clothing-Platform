import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, logAdminAction, AdminRequest } from '../middleware/adminAuth';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Tailor } from '../models/Tailor';
import { DeliveryAgent } from '../models/DeliveryAgent';
import { ClothingCategory } from '../models/ClothingCategory';
import { ClothingProduct } from '../models/ClothingProduct';
import { Order } from '../models/Order';
import { Delivery } from '../models/Delivery';
import { Payment } from '../models/Payment';
import { SupportTicket } from '../models/SupportTicket';
import { AuditLog } from '../models/AuditLog';
import { SystemSetting } from '../models/SystemSetting';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireAdmin);

// =========================================================================
// 1. DASHBOARD & REPORTS
// =========================================================================

/**
 * GET /api/admin/dashboard
 * Summary KPIs and live operational counts from real database data.
 */
router.get('/dashboard', async (_req: AdminRequest, res: Response) => {
  try {
    const [
      totalUsers,
      customers,
      tailors,
      verifiedTailors,
      pendingVerifications,
      totalDeliveryAgents,
      totalOrders,
      activeOrders,
      completedOrdersCount,
      cancelledOrders,
      completedOrdersDocs,
      totalPayments,
      successfulPayments,
      totalDeliveries,
      activeDeliveries,
      completedDeliveries,
      totalTickets,
      openTickets,
      resolvedTickets,
    ] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      Tailor.countDocuments(),
      Tailor.countDocuments({ verificationStatus: 'VERIFIED' }),
      Tailor.countDocuments({ verificationStatus: 'PENDING' }),
      DeliveryAgent.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['ACCEPTED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'MEASUREMENT_VERIFICATION'] } } as any),
      Order.countDocuments({ status: { $in: ['COMPLETED', 'DELIVERED'] } } as any),
      Order.countDocuments({ status: { $in: ['CANCELLED', 'REJECTED'] } } as any),
      Order.find({ status: { $in: ['COMPLETED', 'DELIVERED'] } } as any).select('totalAmount pricingSnapshot'),
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'SUCCESS' }),
      Delivery.countDocuments(),
      Delivery.countDocuments({ status: { $in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } }),
      Delivery.countDocuments({ status: 'DELIVERED' }),
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
      SupportTicket.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } }),
    ]);

    const totalRevenue = completedOrdersDocs.reduce(
      (sum, order) => sum + (order.totalAmount || order.pricingSnapshot?.totalCalculatedPrice || 0),
      0
    );

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
  } catch (error: any) {
    return res.status(500).json({ message: 'Error loading dashboard', error: error.message });
  }
});

/**
 * GET /api/admin/reports
 * Aggregated analytics for orders, revenue, and tailor growth.
 */
router.get('/reports', async (_req: AdminRequest, res: Response) => {
  try {
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalVolume: { $sum: '$totalAmount' } } },
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const ticketsByType = await SupportTicket.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    return res.json({
      ordersByStatus,
      usersByRole,
      ticketsByType,
    });
  } catch (error: any) {
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
router.get('/users', async (req: AdminRequest, res: Response) => {
  try {
    const { role, isActive, search, limit = 20, page = 1 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), users });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend or unsuspend user account.
 */
router.patch('/users/:id/suspend', async (req: AdminRequest, res: Response) => {
  try {
    const { suspend, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isActive = !suspend;
    await user.save();

    await logAdminAction(
      req.user!.sub,
      suspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      'User',
      user._id,
      { email: user.email, reason },
      req
    );

    return res.json({
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully.`,
      isActive: user.isActive,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

/**
 * GET /api/admin/customers
 * List customers.
 */
router.get('/customers', async (_req: AdminRequest, res: Response) => {
  try {
    const customers = await Customer.find()
      .populate('userId', 'name email phone isActive createdAt')
      .sort({ createdAt: -1 });
    return res.json({ customers });
  } catch (error: any) {
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
router.get('/tailors', async (req: AdminRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status) query.verificationStatus = status;

    const tailors = await Tailor.find(query)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 });

    return res.json({ tailors });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching tailors', error: error.message });
  }
});

/**
 * POST /api/admin/tailors/:id/verify
 * Approve tailor application and grant verified status.
 */
router.post('/tailors/:id/verify', async (req: AdminRequest, res: Response) => {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }

    tailor.verificationStatus = 'VERIFIED';
    await tailor.save();

    await logAdminAction(req.user!.sub, 'VERIFY_TAILOR', 'Tailor', tailor._id, { businessName: tailor.businessName }, req);
    return res.json({ message: 'Tailor verified successfully', tailor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying tailor', error: error.message });
  }
});

/**
 * POST /api/admin/tailors/:id/reject
 * Reject tailor application with note.
 */
router.post('/tailors/:id/reject', async (req: AdminRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }

    tailor.verificationStatus = 'REJECTED';
    await tailor.save();

    await logAdminAction(req.user!.sub, 'REJECT_TAILOR', 'Tailor', tailor._id, { reason }, req);
    return res.json({ message: 'Tailor application rejected', status: tailor.verificationStatus, reason });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error rejecting tailor', error: error.message });
  }
});

/**
 * PATCH /api/admin/tailors/:id/status
 * Suspend or change tailor business status.
 */
router.patch('/tailors/:id/status', async (req: AdminRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    if (!['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verificationStatus' });
    }

    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found.' });
    }

    tailor.verificationStatus = status;
    await tailor.save();

    await logAdminAction(req.user!.sub, 'UPDATE_TAILOR_STATUS', 'Tailor', tailor._id, { status, reason }, req);
    return res.json({ message: `Tailor status updated to ${status}`, tailor });
  } catch (error: any) {
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
router.get('/delivery-agents', async (_req: AdminRequest, res: Response) => {
  try {
    const agents = await DeliveryAgent.find()
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 });

    return res.json({ agents });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching delivery agents', error: error.message });
  }
});

// =========================================================================
// 5. CLOTHING CATEGORIES & PRODUCTS
// =========================================================================

/**
 * GET /api/admin/categories
 */
router.get('/categories', async (_req: AdminRequest, res: Response) => {
  try {
    const categories = await ClothingCategory.find().sort({ name: 1 });
    return res.json({ categories });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

/**
 * POST /api/admin/categories
 */
router.post('/categories', async (req: AdminRequest, res: Response) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = new ClothingCategory({ name, description, image });
    await category.save();

    await logAdminAction(req.user!.sub, 'CREATE_CATEGORY', 'ClothingCategory', category._id, { name }, req);
    return res.status(201).json({ message: 'Category created', category });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

/**
 * PUT /api/admin/categories/:id
 */
router.put('/categories/:id', async (req: AdminRequest, res: Response) => {
  try {
    const category = await ClothingCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await logAdminAction(req.user!.sub, 'UPDATE_CATEGORY', 'ClothingCategory', category._id, req.body, req);
    return res.json({ message: 'Category updated', category });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

/**
 * DELETE /api/admin/categories/:id
 */
router.delete('/categories/:id', async (req: AdminRequest, res: Response) => {
  try {
    const category = await ClothingCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await logAdminAction(req.user!.sub, 'DELETE_CATEGORY', 'ClothingCategory', category._id, { name: category.name }, req);
    return res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

/**
 * GET /api/admin/products
 */
router.get('/products', async (req: AdminRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query: any = {};
    if (status) query.availabilityStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const products = await ClothingProduct.find(query)
      .populate('tailorId', 'businessName')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ClothingProduct.countDocuments(query);
    return res.json({ total, page: Number(page), products });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

/**
 * PATCH /api/admin/products/:id/status
 */
router.patch('/products/:id/status', async (req: AdminRequest, res: Response) => {
  try {
    const { availabilityStatus } = req.body;
    const product = await ClothingProduct.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await logAdminAction(req.user!.sub, 'UPDATE_PRODUCT_STATUS', 'ClothingProduct', product._id, { availabilityStatus }, req);
    return res.json({ message: 'Product status updated', product });
  } catch (error: any) {
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
router.get('/orders', async (req: AdminRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const orders = await Order.find(query)
      .populate('customerId', 'name')
      .populate('tailorId', 'businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), orders });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

/**
 * GET /api/admin/payments
 * Monitor platform transactions.
 */
router.get('/payments', async (req: AdminRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const payments = await Payment.find(query)
      .populate('orderId', 'totalAmount currency status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);
    return res.json({ total, page: Number(page), payments });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

/**
 * GET /api/admin/deliveries
 * Monitor transit and delivery status.
 */
router.get('/deliveries', async (req: AdminRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const deliveries = await Delivery.find(query)
      .populate('deliveryAgentId', 'phone vehicleType')
      .populate('orderId', 'totalAmount currency')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Delivery.countDocuments(query);
    return res.json({ total, page: Number(page), deliveries });
  } catch (error: any) {
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
router.get('/tickets', async (req: AdminRequest, res: Response) => {
  try {
    const { status, priority, type } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ count: tickets.length, tickets });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching support tickets', error: error.message });
  }
});

/**
 * GET /api/admin/tickets/:id
 */
router.get('/tickets/:id', async (req: AdminRequest, res: Response) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'name email role');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    return res.json({ ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

/**
 * POST /api/admin/tickets/:id/reply
 * Reply to support ticket or customer complaint.
 */
router.post('/tickets/:id/reply', async (req: AdminRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    ticket.messages.push({
      senderId: req.user!.sub as any,
      senderRole: 'ADMIN',
      senderName: req.user!.name || 'SEWFIT Support Admin',
      message,
      createdAt: new Date(),
    });
    ticket.status = 'IN_PROGRESS';
    await ticket.save();

    await logAdminAction(req.user!.sub, 'REPLY_TICKET', 'SupportTicket', ticket._id, { ticketNumber: ticket.ticketNumber }, req);
    return res.json({ message: 'Reply sent successfully', ticket });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error replying to ticket', error: error.message });
  }
});

/**
 * PATCH /api/admin/tickets/:id/status
 * Resolve or close ticket.
 */
router.patch('/tickets/:id/status', async (req: AdminRequest, res: Response) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    await logAdminAction(
      req.user!.sub,
      'UPDATE_TICKET_STATUS',
      'SupportTicket',
      ticket._id,
      { status, resolutionNotes },
      req
    );

    return res.json({ message: `Ticket updated to ${status}`, ticket });
  } catch (error: any) {
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
router.get('/audit-logs', async (req: AdminRequest, res: Response) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find()
      .sort({ timestamp: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments();
    return res.json({ total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), logs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

/**
 * GET /api/admin/settings
 * List platform settings.
 */
router.get('/settings', async (_req: AdminRequest, res: Response) => {
  try {
    const settings = await SystemSetting.find().sort({ category: 1, key: 1 });
    return res.json({ settings });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching system settings', error: error.message });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update system setting value.
 */
router.put('/settings/:key', async (req: AdminRequest, res: Response) => {
  try {
    const { value, description, category } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key: req.params.key },
      {
        value,
        description,
        category: category || 'GENERAL',
        updatedBy: req.user!.sub,
      },
      { upsert: true, new: true }
    );

    await logAdminAction(
      req.user!.sub,
      'UPDATE_SYSTEM_SETTING',
      'SystemSetting',
      setting._id,
      { key: setting.key, value },
      req
    );

    return res.json({ message: 'Setting updated successfully', setting });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating system setting', error: error.message });
  }
});

export default router;
