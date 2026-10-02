
# 1. Base Image - Lightweight & secure Alpine Linux
FROM node:20-alpine AS base

WORKDIR /app

# 2. Dependency Installation Stage (Cached Layer)
# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly and deterministically
RUN npm ci --omit=dev && npm cache clean --force

# 3. Source Code Stage
# Copy application code into container
COPY src/ ./src/
COPY public/ ./public/
COPY index.js ./

# 4. Security: Non-Root Execution
# Use existing 'node' user provided by Node Alpine image (avoids running as root)
RUN chown -R node:node /app
USER node

# 5. Environment & Ports
ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

# 6. Built-in Container Health Check
# Alpine has 'wget' built-in (no extra curl package needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# 7. Start the API Server
CMD ["node", "src/server.js"]
