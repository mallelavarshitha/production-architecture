# ==========================================
# Project 75 Frontend Multi-Stage Dockerfile
# Stage 1: Build React/Vite application
# Stage 2: Serve static production assets via lightweight Nginx Alpine
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with clean cache
COPY package.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force

# Copy source code and build
COPY index.html ./
COPY vite.config.js ./
COPY src ./src

RUN npm run build

# Stage 2: Production runtime stage
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document internal port
EXPOSE 80

# Health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/health || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
