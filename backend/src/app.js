const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security and standard middlewares
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Lightweight request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl !== '/api/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/tasks', taskRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
