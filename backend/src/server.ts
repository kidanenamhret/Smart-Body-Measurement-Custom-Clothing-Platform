// src/server.ts – Express API for SEWFIT
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRouter from './routes/auth';
import tailorRouter from './routes/tailor';
import deliveryRouter from './routes/delivery';
import adminRouter from './routes/admin';
import measurementsRouter from './routes/measurements';
import productsRouter from './routes/products';
import favoritesRouter from './routes/favorites';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import paymentsRouter from './routes/payments';
import addressesRouter from './routes/addresses';
import notificationsRouter from './routes/notifications';
import reviewsRouter from './routes/reviews';
import supportRouter from './routes/support';
import { seedInitialCategories } from './models/ClothingCategory';
import { Tailor } from './models/Tailor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to Database & Seed Initial Categories
connectDB().then(() => {
  seedInitialCategories();
});

app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);
app.use('/api/tailor', tailorRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/measurements', measurementsRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', productsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/support', supportRouter);

// Health check / welcome
app.get('/', (req, res) => res.send('SEWFIT backend is running'));

// Public Tailors Discovery API for Customers
app.get('/api/tailors', async (req, res) => {
  try {
    const tailors = await Tailor.find({ verificationStatus: { $in: ['VERIFIED', 'PENDING'] } })
      .select('businessName description profileImage businessImages services averageRating reviewCount location businessAddress');

    if (tailors.length > 0) {
      return res.json({ tailors });
    }
  } catch (err) {
    // fallback if DB query fails or empty
  }

  const mockTailors = [
    { id: 1, businessName: 'Elegant Stitch', averageRating: 4.8, profileImage: '/assets/tailor_1.png', services: ['Bespoke Suits', 'Tuxedos'] },
    { id: 2, businessName: 'Classic Couture', averageRating: 4.5, profileImage: '/assets/tailor_2.png', services: ['Traditional Habesha Dresses', 'Gowns'] },
    { id: 3, businessName: 'Modern Fit', averageRating: 4.7, profileImage: '/assets/tailor_3.png', services: ['Alterations', 'Shirts', 'Pants'] },
  ];
  return res.json({ tailors: mockTailors });
});


app.listen(PORT, () => {
  console.log(`🚀 SEWFIT backend listening on http://localhost:${PORT}`);
});
