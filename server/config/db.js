const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic and event listeners.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are defaults in mongoose 7+ but listed for clarity
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📦 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown on SIGINT
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Mongoose connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
