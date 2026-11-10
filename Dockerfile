# ==========================================
# Production Multi-Stage Dockerfile for Kubernetes & Docker Hub
# Stage 1: Build React Vite Frontend
# Stage 2: Node.js Express Backend + Embedded Frontend
# ==========================================

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force

COPY frontend/index.html ./
COPY frontend/vite.config.js ./
COPY frontend/src ./src

RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend production dependencies
COPY backend/package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy backend application source
COPY backend/src ./src

# Copy built frontend assets from stage 1 into public
COPY --from=frontend-builder /app/frontend/dist ./public

# Secure non-root user execution
RUN chown -R node:node /app
USER node

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node src/healthcheck.js || exit 1

# Start the Express server (serves REST API and React SPA)
CMD ["node", "src/server.js"]
