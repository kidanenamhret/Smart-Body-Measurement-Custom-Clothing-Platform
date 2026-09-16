import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Customer } from '../models/Customer';
import { ClothingProduct } from '../models/ClothingProduct';
import { calculateGarmentPrice } from '../utils/pricing';
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

// All cart routes require authentication
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
 * Helper function to recalculate and validate all cart item prices server-side.
 * Never trust prices supplied by the client!
 */
async function recalculateCartPrices(cart: any) {
  if (!cart.items || cart.items.length === 0) return cart;

  for (const item of cart.items) {
    const product = await ClothingProduct.findById(item.productId);
    if (product) {
      const serverPrice = calculateGarmentPrice(product, item.customization || {});
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
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    let cart = await Cart.findOne({ customerId: customer._id })
      .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
      .populate('items.tailorId', 'businessName profileImage location')
      .populate('items.measurementProfileId', 'profileName version bodyShape');

    if (!cart) {
      cart = new Cart({
        customerId: customer._id,
        items: [],
        currency: 'ETB',
      });
      await cart.save();
    } else {
      await recalculateCartPrices(cart);
    }

    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

/**
 * POST /api/cart/items
 * Add an item to cart or update existing quantity.
 * Mandatory Server-Side Price Calculation!
 */
router.post('/items', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    const { productId, tailorId, quantity, measurementProfileId, customization } = req.body;

    if (!productId || !tailorId || !measurementProfileId) {
      return res.status(400).json({ message: 'productId, tailorId, and measurementProfileId are required.' });
    }

    const prodIdStr = String(productId);
    const product = await ClothingProduct.findById(prodIdStr);
    if (!product) {
      return res.status(404).json({ message: 'Clothing product not found.' });
    }

    // Authoritatively calculate price on the backend
    const priceCalculation = calculateGarmentPrice(product, customization || {});
    const authoritativePrice = priceCalculation.totalCalculatedPrice;

    let cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) {
      cart = new Cart({
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
      cart.items[existingIndex].measurementProfileId = new Types.ObjectId(String(measurementProfileId));
    } else {
      cart.items.push({
        productId: new Types.ObjectId(prodIdStr),
        tailorId: new Types.ObjectId(String(tailorId)),
        quantity: q,
        measurementProfileId: new Types.ObjectId(String(measurementProfileId)),
        customization: customization || {},
        calculatedPrice: authoritativePrice,
      });
    }

    await cart.save();

    // Re-populate details for response
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
      .populate('items.tailorId', 'businessName profileImage location')
      .populate('items.measurementProfileId', 'profileName version bodyShape');

    return res.status(201).json({
      message: 'Item added to cart with server-validated price!',
      cart: populatedCart,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

/**
 * PUT /api/cart/items/:productId
 * Update quantity or customization of a cart item with server price recalculation.
 */
router.put('/items/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const prodIdStr = String(req.params.productId);
    const { quantity, customization, measurementProfileId } = req.body;

    const cart = await Cart.findOne({ customerId: customer._id });
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
    if (measurementProfileId && Types.ObjectId.isValid(String(measurementProfileId))) {
      item.measurementProfileId = new Types.ObjectId(String(measurementProfileId));
    }
    if (customization) {
      item.customization = customization;
    }

    // Re-evaluate item price server-side
    const product = await ClothingProduct.findById(prodIdStr);
    if (product) {
      const serverPrice = calculateGarmentPrice(product, item.customization || {});
      item.calculatedPrice = serverPrice.totalCalculatedPrice;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
      .populate('items.tailorId', 'businessName profileImage location')
      .populate('items.measurementProfileId', 'profileName version bodyShape');

    return res.json({
      message: 'Cart item updated and price recalculated server-side!',
      cart: populatedCart,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
});

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart.
 */
router.delete('/items/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const prodIdStr = String(req.params.productId);
    const cart = await Cart.findOne({ customerId: customer._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((i) => String(i.productId) !== prodIdStr);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name images basePrice currency availabilityStatus requiredMeasurements')
      .populate('items.tailorId', 'businessName profileImage location')
      .populate('items.measurementProfileId', 'profileName version bodyShape');

    return res.json({
      message: 'Item removed from cart',
      cart: populatedCart,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart.
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const cart = await Cart.findOne({ customerId: customer._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.json({ message: 'Cart cleared successfully', cart });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
});

export default router;
