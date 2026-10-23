# ==========================================
# Project 75 Backend Dockerfile
# Production-ready, security-hardened, non-root Node.js Alpine
# ==========================================
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy application source code
COPY src ./src
COPY src/healthcheck.js ./src/healthcheck.js

# Ensure non-root node user owns the app directory
RUN chown -R node:node /app

# Switch to standard non-root user
USER node

# Document internal container port (not published to host)
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node src/healthcheck.js || exit 1

# Start the Express server
CMD ["node", "src/server.js"]
