import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Favorite } from '../models/Favorite';
import { Customer } from '../models/Customer';
import { Types } from 'mongoose';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    email: string;
  };
}

// All favorites routes require authentication
router.use(authenticateToken);

async function getOrCreateCustomer(userId: string) {
  let customer = await Customer.findOne({ userId });
  if (!customer) {
    customer = new Customer({ userId: new Types.ObjectId(userId) });
    await customer.save();
  }
  return customer;
}

/**
 * GET /api/favorites
 * List all favorited garments and tailors for the authenticated customer.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.json({ favorites: [] });
    }

    const favorites = await Favorite.find({ customerId: customer._id })
      .populate('productId', 'name images basePrice currency availabilityStatus categoryId')
      .populate('tailorId', 'businessName profileImage averageRating reviewCount location businessAddress')
      .sort({ createdAt: -1 });

    return res.json({ count: favorites.length, favorites });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

/**
 * POST /api/favorites
 * Add a clothing product or tailor to customer's favorites.
 * PREVENT DUPLICATE FAVORITE RECORDS.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    const { productId, tailorId } = req.body;

    if (!productId && !tailorId) {
      return res.status(400).json({ message: 'Either productId or tailorId must be provided.' });
    }

    // Check for existing duplicate record
    const duplicateQuery: any = { customerId: customer._id };
    if (productId && Types.ObjectId.isValid(String(productId))) {
      duplicateQuery.productId = new Types.ObjectId(String(productId));
    } else if (tailorId && Types.ObjectId.isValid(String(tailorId))) {
      duplicateQuery.tailorId = new Types.ObjectId(String(tailorId));
    }

    const existing = await Favorite.findOne(duplicateQuery);
    if (existing) {
      return res.status(409).json({
        message: 'Duplicate favorite record prevented. Item is already in favorites.',
        favorite: existing,
      });
    }

    const favorite = new Favorite({
      customerId: customer._id,
      productId: productId && Types.ObjectId.isValid(String(productId)) ? new Types.ObjectId(String(productId)) : undefined,
      tailorId: tailorId && Types.ObjectId.isValid(String(tailorId)) ? new Types.ObjectId(String(tailorId)) : undefined,
    });

    await favorite.save();

    return res.status(201).json({
      message: 'Item added to favorites successfully',
      favorite,
    });
  } catch (error: any) {
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
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const idParam = String(req.params.id);
    const deleted = await Favorite.findOneAndDelete({
      _id: idParam,
      customerId: customer._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite record not found.' });
    }

    return res.json({ message: 'Favorite item removed successfully', favoriteId: idParam });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
});

export default router;
