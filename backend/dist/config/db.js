"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        mongoose_1.default.set('bufferCommands', false);
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sewfit';
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 2000,
        });
        console.log('⚡ MongoDB connected successfully');
    }
    catch (error) {
        console.warn('⚠️ MongoDB connection warning:', error.message);
        console.warn('Tip: Application will run using resilient in-memory database mode for registration, auth, and dashboards.');
    }
};
exports.default = connectDB;
