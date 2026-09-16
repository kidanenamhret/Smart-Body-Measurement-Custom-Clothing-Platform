import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireTailorRole, requireTailorProfile, TailorRequest } from '../middleware/tailorAuth';
import { Tailor } from '../models/Tailor';
import { ClothingProduct } from '../models/ClothingProduct';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { Types } from 'mongoose';

const router = Router();

// All tailor endpoints require authentication
router.use(authenticateToken);

// =========================================================================
// 1. BUSINESS PROFILE & VERIFICATION
// =========================================================================

/**
 * POST /api/tailor/profile
 * Create the tailor's initial business profile.
 */
router.post('/profile', requireTailorRole, async (req: TailorRequest, res: Response) => {
  try {
    const userId = req.user!.sub;
    const existing = await Tailor.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: 'Tailor profile already exists for this user.' });
    }

    const {
      businessName,
      description,
      phone,
      businessAddress,
      location,
      profileImage,
      businessImages,
      services,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required.' });
    }

    const tailor = new Tailor({
      userId,
      businessName,
      description,
      phone,
      businessAddress,
      location,
      profileImage,
      businessImages: businessImages || [],
      services: services || [],
      verificationStatus: 'PENDING',
    });

    await tailor.save();
    return res.status(201).json({ message: 'Tailor profile created successfully', tailor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating tailor profile', error: error.message });
  }
});

/**
 * GET /api/tailor/profile
 * Get the current tailor's business profile.
 */
router.get('/profile', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  return res.json({ tailor: req.tailor });
});

/**
 * PUT /api/tailor/profile
 * Update business details, contact information, images, bio.
 */
router.put('/profile', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const tailor = req.tailor!;
    const updatableFields = [
      'businessName',
      'description',
      'phone',
      'businessAddress',
      'location',
      'profileImage',
      'businessImages',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (tailor as any)[field] = req.body[field];
      }
    });

    await tailor.save();
    return res.json({ message: 'Tailor profile updated successfully', tailor });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating tailor profile', error: error.message });
  }
});

/**
 * POST /api/tailor/verification
 * Submit verification information (e.g. government ID, business license).
 */
router.post('/verification', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one verification document is required.' });
    }

    const tailor = req.tailor!;
    tailor.verificationDocuments = [
      ...(tailor.verificationDocuments || []),
      ...documents,
    ];
    tailor.verificationStatus = 'PENDING';
    await tailor.save();

    return res.json({
      message: 'Verification information submitted successfully and pending admin review.',
      verificationStatus: tailor.verificationStatus,
      documentsCount: tailor.verificationDocuments.length,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error submitting verification information', error: error.message });
  }
});

/**
 * PUT /api/tailor/services
 * Manage offered services (e.g. Bespoke Suits, Traditional Attire, Alterations).
 */
router.put('/services', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const { services } = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ message: 'Services must be an array of strings.' });
    }

    const tailor = req.tailor!;
    tailor.services = services;
    await tailor.save();

    return res.json({ message: 'Services updated successfully', services: tailor.services });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating services', error: error.message });
  }
});

// =========================================================================
// 2. CLOTHING PRODUCTS & CATALOG CONFIGURATION
// =========================================================================

/**
 * POST /api/tailor/products
 * Create a new clothing product with pricing, fabrics, colors, customization options, and required measurements.
 */
router.post('/products', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const tailor = req.tailor!;
    const {
      categoryId,
      name,
      description,
      images,
      basePrice,
      currency,
      availableSizes,
      fabricOptions,
      colorOptions,
      customizationOptions,
      requiredMeasurements,
      productionTimeDays,
    } = req.body;

    if (!name || basePrice === undefined) {
      return res.status(400).json({ message: 'Product name and base price are required.' });
    }

    if (!requiredMeasurements || !Array.isArray(requiredMeasurements) || requiredMeasurements.length === 0) {
      return res.status(400).json({
        message: 'You must define at least one required measurement key (e.g., ["chest", "waist", "inseam"]).',
      });
    }

    const product = new ClothingProduct({
      tailorId: tailor._id,
      categoryId: categoryId || new Types.ObjectId(),
      name,
      description,
      images: images || [],
      basePrice,
      currency: currency || 'ETB',
      availableSizes: availableSizes || [],
      fabricOptions: fabricOptions || [],
      colorOptions: colorOptions || [],
      customizationOptions: customizationOptions || {},
      requiredMeasurements,
      productionTimeDays: productionTimeDays || 7,
      availabilityStatus: 'ACTIVE',
    });

    await product.save();
    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

/**
 * GET /api/tailor/products
 * List all clothing products belonging to this tailor.
 */
router.get('/products', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const products = await ClothingProduct.find({ tailorId: req.tailor!._id }).sort({ createdAt: -1 });
    return res.json({ products });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error listing products', error: error.message });
  }
});

/**
 * GET /api/tailor/products/:id
 * Retrieve product details.
 */
router.get('/products/:id', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const product = await ClothingProduct.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json({ product });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

/**
 * PUT /api/tailor/products/:id
 * Update pricing, fabrics, colors, customization options, images, and required measurements.
 */
router.put('/products/:id', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const product = await ClothingProduct.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const fields = [
      'name',
      'description',
      'images',
      'basePrice',
      'currency',
      'availableSizes',
      'fabricOptions',
      'colorOptions',
      'customizationOptions',
      'requiredMeasurements',
      'productionTimeDays',
      'availabilityStatus',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    });

    await product.save();
    return res.json({ message: 'Product updated successfully', product });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

/**
 * DELETE /api/tailor/products/:id
 * Set availability status to INACTIVE.
 */
router.delete('/products/:id', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const product = await ClothingProduct.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.availabilityStatus = 'INACTIVE';
    await product.save();
    return res.json({ message: 'Product deactivated successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deactivating product', error: error.message });
  }
});

// =========================================================================
// 3. ORDER LIFECYCLE & PRIVACY-PROTECTED MEASUREMENT REVIEW
// =========================================================================

/**
 * GET /api/tailor/orders
 * List orders placed specifically with this tailor.
 * Filter by status if provided (e.g. ?status=PENDING_ACCEPTANCE).
 */
router.get('/orders', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const query: any = { tailorId: req.tailor!._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name')
      .populate('items.productId', 'name images basePrice')
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

/**
 * GET /api/tailor/orders/:id
 * Review order details and customer measurements related to THIS order.
 * 
 * PRIVACY SECURITY GUARANTEE:
 * Returns the `measurementSnapshot` embedded within the order ONLY if this order
 * belongs to the authenticated tailor (`order.tailorId === req.tailor._id`).
 * Tailors can NEVER query arbitrary customer measurement profiles.
 */
router.get('/orders/:id', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    }).populate('customerId', 'name phone profileImage');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found or you do not have permission to access this order.',
      });
    }

    return res.json({
      orderId: order._id,
      status: order.status,
      productionStatus: order.productionStatus,
      measurementVerified: order.measurementVerified,
      qualityChecked: order.qualityChecked,
      qualityCheckNotes: order.qualityCheckNotes,
      totalAmount: order.totalAmount,
      currency: order.currency,
      items: (order.items || []).map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        customization: item.customization,
        // Measurement snapshot specific to this garment order item
        measurementSnapshot: item.measurementSnapshot,
      })),
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
});

/**
 * POST /api/tailor/orders/:id/accept
 * Accept an incoming customer order.
 */
router.post('/orders/:id/accept', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = 'ACCEPTED';
    order.statusHistory.push({
      status: 'ACCEPTED',
      changedAt: new Date(),
      note: 'Order accepted by tailor.',
    });
    await order.save();

    return res.json({ message: 'Order accepted successfully', status: order.status });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error accepting order', error: error.message });
  }
});

/**
 * POST /api/tailor/orders/:id/reject
 * Reject an incoming customer order with a reason.
 */
router.post('/orders/:id/reject', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = 'REJECTED';
    order.rejectionReason = reason || 'Declined by tailor';
    order.statusHistory.push({
      status: 'REJECTED',
      changedAt: new Date(),
      note: order.rejectionReason,
    });
    await order.save();

    return res.json({ message: 'Order rejected', status: order.status, reason: order.rejectionReason });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error rejecting order', error: error.message });
  }
});

/**
 * POST /api/tailor/orders/:id/verify-measurements
 * Verify customer measurements for this specific order.
 */
router.post('/orders/:id/verify-measurements', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.measurementVerified = true;
    order.measurementVerifiedAt = new Date();
    order.status = 'MEASUREMENTS_VERIFIED';
    order.statusHistory.push({
      status: 'MEASUREMENTS_VERIFIED',
      changedAt: new Date(),
      note: 'Customer measurements reviewed and verified by tailor.',
    });
    await order.save();

    return res.json({
      message: 'Measurements verified successfully',
      status: order.status,
      measurementVerified: order.measurementVerified,
      verifiedAt: order.measurementVerifiedAt,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying measurements', error: error.message });
  }
});

/**
 * PATCH /api/tailor/orders/:id/production-status
 * Update production phase (e.g. CUTTING, SEWING, FITTING, FINISHING).
 */
router.patch('/orders/:id/production-status', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const { productionStatus, note } = req.body;
    if (!productionStatus) {
      return res.status(400).json({ message: 'productionStatus is required (e.g., CUTTING, SEWING, FITTING).' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = 'IN_PRODUCTION';
    order.productionStatus = productionStatus;
    order.statusHistory.push({
      status: `IN_PRODUCTION (${productionStatus})`,
      changedAt: new Date(),
      note: note || `Production phase updated to ${productionStatus}`,
    });
    await order.save();

    return res.json({
      message: 'Production status updated successfully',
      status: order.status,
      productionStatus: order.productionStatus,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating production status', error: error.message });
  }
});

/**
 * POST /api/tailor/orders/:id/quality-check
 * Record quality inspection pass and feedback notes.
 */
router.post('/orders/:id/quality-check', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const { passed, notes } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.qualityChecked = passed !== false; // defaults to true
    order.qualityCheckedAt = new Date();
    order.qualityCheckNotes = notes || 'Passed standard SEWFIT garment quality inspection.';
    order.status = 'QUALITY_CHECK';
    order.statusHistory.push({
      status: 'QUALITY_CHECK',
      changedAt: new Date(),
      note: order.qualityCheckNotes,
    });
    await order.save();

    return res.json({
      message: 'Quality check recorded successfully',
      qualityChecked: order.qualityChecked,
      qualityCheckNotes: order.qualityCheckNotes,
      checkedAt: order.qualityCheckedAt,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error recording quality check', error: error.message });
  }
});

/**
 * POST /api/tailor/orders/:id/ready
 * Mark order as completed and ready for customer pickup or delivery.
 */
router.post('/orders/:id/ready', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tailorId: req.tailor!._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = 'READY_FOR_DELIVERY';
    order.readyAt = new Date();
    order.statusHistory.push({
      status: 'READY_FOR_DELIVERY',
      changedAt: new Date(),
      note: 'Garment production completed. Ready for dispatch.',
    });
    await order.save();

    return res.json({
      message: 'Order marked ready for delivery / pickup',
      status: order.status,
      readyAt: order.readyAt,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error marking order ready', error: error.message });
  }
});

// =========================================================================
// 4. REVIEWS & NOTIFICATIONS
// =========================================================================

/**
 * GET /api/tailor/reviews
 * View reviews submitted by customers for this tailor.
 */
router.get('/reviews', requireTailorProfile, async (req: TailorRequest, res: Response) => {
  try {
    const reviews = await Review.find({ tailorId: req.tailor!._id })
      .populate('customerId', 'name')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });

    return res.json({
      averageRating: req.tailor!.averageRating || 0,
      reviewCount: req.tailor!.reviewCount || 0,
      reviews,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

/**
 * GET /api/tailor/notifications
 * List notifications for the tailor.
 */
router.get('/notifications', async (req: TailorRequest, res: Response) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user!.sub,
      recipientRole: 'TAILOR',
    }).sort({ createdAt: -1 });

    return res.json({ notifications });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

/**
 * PATCH /api/tailor/notifications/:id/read
 * Mark a notification as read.
 */
router.patch('/notifications/:id/read', async (req: TailorRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user!.sub,
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.json({ message: 'Notification marked as read', notification });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

export default router;
