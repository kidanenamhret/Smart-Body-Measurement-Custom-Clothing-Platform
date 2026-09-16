import { Router, Request, Response } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Tailor } from '../models/Tailor';
import { logAuditEvent } from '../utils/auditLogger';

const router = Router();

// POST /api/reviews - Submit customer review for completed order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, tailorId, rating, comment, photos } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ error: 'orderId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // 1. Verify Order exists and status === 'DELIVERED'
    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId }] });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
      return res.status(403).json({
        error: 'Only completed and delivered orders are eligible for customer review',
        currentStatus: order.status,
      });
    }

    // 2. Prevent Duplicate Review
    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview) {
      return res.status(409).json({
        error: 'A review has already been submitted for this order',
        reviewId: existingReview._id,
      });
    }

    // 3. Create Review
    const review = await Review.create({
      customerId: customerId || order.customerId,
      tailorId: tailorId || order.tailorId,
      orderId: order._id,
      productId: order.productId,
      rating: Number(rating),
      comment,
      photos,
    });

    // 4. Update Tailor Average Rating
    const targetTailorId = tailorId || order.tailorId;
    if (targetTailorId) {
      const allTailorReviews = await Review.find({ tailorId: targetTailorId });
      const avg = allTailorReviews.reduce((acc, curr) => acc + curr.rating, 0) / allTailorReviews.length;
      await Tailor.findByIdAndUpdate(targetTailorId, {
        averageRating: Number(avg.toFixed(1)),
        reviewCount: allTailorReviews.length,
      });
    }

    // 5. Log Audit Event
    await logAuditEvent(
      { userId: String(customerId || order.customerId), role: 'CUSTOMER' },
      'CREATE_REVIEW',
      'Review',
      String(review._id),
      { orderId: String(order.orderId), rating, tailorId: String(targetTailorId) }
    );

    return res.status(201).json({
      message: 'Review submitted successfully!',
      review,
    });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return res.status(500).json({ error: 'Internal server error submitting review', details: err.message });
  }
});

// GET /api/reviews/tailor/:tailorId - Get reviews for a tailor
router.get('/tailor/:tailorId', async (req: Request, res: Response) => {
  try {
    const { tailorId } = req.params;
    const reviews = await Review.find({ tailorId }).sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;

    return res.json({
      tailorId,
      averageRating: Number(avgRating.toFixed(1)),
      reviewCount: total,
      reviews,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch tailor reviews', details: err.message });
  }
});

// GET /api/reviews/eligibility/:orderId - Check review eligibility
router.get('/eligibility/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId }] });

    if (!order) {
      return res.status(404).json({ isEligible: false, reason: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
      return res.json({
        isEligible: false,
        reason: 'Order has not been delivered yet.',
        status: order.status,
      });
    }

    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview) {
      return res.json({
        isEligible: false,
        reason: 'Order already reviewed.',
        existingReview,
      });
    }

    return res.json({
      isEligible: true,
      orderId: order.orderId,
      tailorId: order.tailorId,
      customerId: order.customerId,
    });
  } catch (err: any) {
    return res.status(500).json({ isEligible: false, reason: err.message });
  }
});

export default router;
