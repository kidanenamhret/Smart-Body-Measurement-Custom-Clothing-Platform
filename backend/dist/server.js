"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts – Express API for SEWFIT
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const tailor_1 = __importDefault(require("./routes/tailor"));
const delivery_1 = __importDefault(require("./routes/delivery"));
const admin_1 = __importDefault(require("./routes/admin"));
const measurements_1 = __importDefault(require("./routes/measurements"));
const products_1 = __importDefault(require("./routes/products"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const support_1 = __importDefault(require("./routes/support"));
const ClothingCategory_1 = require("./models/ClothingCategory");
const Tailor_1 = require("./models/Tailor");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Connect to Database & Seed Initial Categories
(0, db_1.default)().then(() => {
    (0, ClothingCategory_1.seedInitialCategories)();
});
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/tailor', tailor_1.default);
app.use('/api/delivery', delivery_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/measurements', measurements_1.default);
app.use('/api/products', products_1.default);
app.use('/api/categories', products_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/addresses', addresses_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/support', support_1.default);
// Health check / welcome
app.get('/', (req, res) => res.send('SEWFIT backend is running'));
// Public Tailors Discovery API for Customers
app.get('/api/tailors', async (req, res) => {
    try {
        const tailors = await Tailor_1.Tailor.find({ verificationStatus: { $in: ['VERIFIED', 'PENDING'] } })
            .select('businessName description profileImage businessImages services averageRating reviewCount location businessAddress');
        if (tailors.length > 0) {
            return res.json({ tailors });
        }
    }
    catch (err) {
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
