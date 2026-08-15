import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB Connection Error to MONGO_URI: ${err.message}`);
    }
  }

  // Fallback for local development only (not Vercel)
  if (!process.env.VERCEL) {
    try {
      console.log('Starting in-memory MongoDB server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log('MongoDB Connected to In-Memory DB');
    } catch (memErr) {
      console.error('Failed to start MongoMemoryServer:', memErr.message);
    }
  }
};

export const isDbConnected = () => isConnected || mongoose.connection.readyState >= 1;
