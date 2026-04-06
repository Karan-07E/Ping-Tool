import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Only exit in non-serverless environments
    if (typeof process.env.VERCEL === 'undefined') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
