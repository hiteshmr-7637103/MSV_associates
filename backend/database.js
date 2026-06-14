import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/msv_insurance';

export const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('MongoDB connected successfully!');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('WARNING: Could not connect to MongoDB. Server will attempt to use file-based fallback storage.');
    return false;
  }
};
