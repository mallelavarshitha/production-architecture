const express = require('express');
const dbConfig = require('../config/db');

const router = express.Router();

/**
 * @desc    Application and Database Health Check
 * @route   GET /api/health
 */
router.get('/', (req, res) => {
  const dbStatus = dbConfig.getDBStatus();
  const isHealthy = dbStatus.isConnected;

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'project75-production-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      name: dbStatus.name || 'taskdb',
    },
  };

  const statusCode = isHealthy ? 200 : 503;
  return res.status(statusCode).json(healthData);
});

module.exports = router;
