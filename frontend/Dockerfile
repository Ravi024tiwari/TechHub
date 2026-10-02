

# --------------------------------------------------------
# STAGE 1: Builder
# --------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci

COPY . .

# Build-time environment variable for backend API URL (defaults to relative /api/v1 for reverse proxy)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Compile and optimize production build into /app/dist
RUN npm run build

# --------------------------------------------------------
# STAGE 2: Production Web Server (Final Image)
# --------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (handles SPA client-side routing & caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Production Healthcheck for Nginx
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
