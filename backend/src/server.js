require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

let server;

const startServer = async () => {
  try {
    // Attempt database connection with retries
    await connectDB();

    server = http.createServer(app);

    server.listen(PORT, HOST, () => {
      console.log(`[Server] Project 75 Express Backend running on http://${HOST}:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error(`[Server] Fatal startup error: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('[DB] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error(`[DB] Error closing MongoDB connection: ${err.message}`);
        process.exit(1);
      }
    });

    // Force exit if cleanup takes longer than 10 seconds
    setTimeout(() => {
      console.error('[Server] Graceful shutdown timed out. Forcing termination.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
