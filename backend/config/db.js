const mongoose = require("mongoose");

/**
 * Establishes a connection to MongoDB with optimized settings
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 */
const connectDB = async () => {
  // Validate environment variable
  if (!process.env.MONGO_URI) {
    console.error("MongoDB connection error: MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  // Configure mongoose with modern settings
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    connectTimeoutMS: 10000, // Give up initial connection after 10s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain minimum 2 connections
    heartbeatFrequencyMS: 30000, // Check connection status every 30s
    retryWrites: true, // Enable retryable writes
    retryReads: true // Enable retryable reads
  };

  try {
    // Set mongoose debugging based on environment
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    // Connection events for better debugging
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      console.log(`  - Database: ${conn.connection.name}`);
      console.log(`  - Port: ${conn.connection.port}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('♻️ MongoDB reconnected');
    });

    // Close the Mongoose connection when Node process ends
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    
    // Enhanced error handling
    switch (err.name) {
      case 'MongooseServerSelectionError':
        console.error('  - Could not connect to any servers in your MongoDB cluster');
        console.error('  - Check your network connection and MongoDB URI');
        break;
      case 'MongoParseError':
        console.error('  - Invalid MongoDB connection string format');
        console.error('  - Expected format: mongodb+srv://user:password@cluster.example.com/dbname');
        break;
      case 'MongoNetworkError':
        console.error('  - Network connectivity issue');
        console.error('  - Check your internet connection and firewall settings');
        break;
      default:
        console.error('  - Unexpected connection error');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;