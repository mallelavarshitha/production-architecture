const mongoose = require('mongoose');

const connectDB = async (retries = 5, interval = 5000) => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('[DB] MONGO_URI environment variable is missing.');
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[DB] Attempting connection to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`[DB] MongoDB Connected successfully to host: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`[DB] Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) {
        console.error('[DB] All connection attempts exhausted.');
        throw err;
      }
      console.log(`[DB] Retrying connection in ${interval / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
};

const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    name: mongoose.connection.name || null,
  };
};

module.exports = { connectDB, getDBStatus };
