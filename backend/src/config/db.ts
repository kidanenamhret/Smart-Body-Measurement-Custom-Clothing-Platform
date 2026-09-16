import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sewfit';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('⚡ MongoDB connected successfully');
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection warning:', error.message);
    console.warn('Tip: Application will run using resilient in-memory database mode for registration, auth, and dashboards.');
  }
};

export default connectDB;
