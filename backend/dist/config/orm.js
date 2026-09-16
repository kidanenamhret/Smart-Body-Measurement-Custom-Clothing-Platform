"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const BodyMeasurementProfile_1 = require("../models/BodyMeasurementProfile");
const MeasurementSession_1 = require("../models/MeasurementSession");
const ClothingCategory_1 = require("../models/ClothingCategory");
const ClothingProduct_1 = require("../models/ClothingProduct");
const Cart_1 = require("../models/Cart");
const Order_1 = require("../models/Order");
const DeliveryAgent_1 = require("../models/DeliveryAgent");
const Tailor_1 = require("../models/Tailor");
const Customer_1 = require("../models/Customer");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite', // use SQLite for local dev; swap to postgres in prod via env
    database: process.env.SQLITE_DB_PATH || 'dev.sqlite',
    synchronize: false,
    logging: ['error', 'query'],
    entities: [
        User_1.User,
        BodyMeasurementProfile_1.BodyMeasurementProfile,
        MeasurementSession_1.MeasurementSession,
        ClothingCategory_1.ClothingCategory,
        ClothingProduct_1.ClothingProduct,
        Cart_1.Cart,
        Order_1.Order,
        DeliveryAgent_1.DeliveryAgent,
        Tailor_1.Tailor,
        Customer_1.Customer,
    ],
});
