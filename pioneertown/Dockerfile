# Use Node.js LTS Alpine image for smaller size
FROM node:20-alpine AS builder

# Cache busting - add build timestamp and version info
ARG BUILDTIME=unknown
ARG VERSION=unknown
ARG CACHEBUST=1
LABEL buildtime=${BUILDTIME}
LABEL version=${VERSION}
LABEL cachebust=${CACHEBUST}

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production=false && \
    npm audit --audit-level=high

# Copy source code with proper ownership
# Note: Config files (postcss.config.js, tailwind.config.js, vite.config.js) 
# are essential for CSS processing and must be included in the Docker build
# Cache bust: Force rebuild when source files change
RUN echo "Cache bust: ${CACHEBUST} at ${BUILDTIME}" > /tmp/build-info
COPY --chown=nextjs:nodejs . .

# Build the application
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine AS production

# Install security updates and remove unnecessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/* && \
    # Remove default nginx content
    rm -rf /usr/share/nginx/html/* && \
    # Create non-root user (use different GID to avoid conflicts)
    addgroup -g 1001 -S nginx-custom && \
    adduser -S nginx-custom -u 1001 -G nginx-custom && \
    # Set proper permissions for nginx directories
    chown -R nginx-custom:nginx-custom /var/cache/nginx && \
    chown -R nginx-custom:nginx-custom /var/log/nginx && \
    chown -R nginx-custom:nginx-custom /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-custom:nginx-custom /var/run/nginx.pid && \
    # Make directories writable
    chmod 755 /var/cache/nginx && \
    chmod 755 /var/log/nginx

# Copy built assets from builder stage with proper ownership
COPY --from=builder --chown=nginx-custom:nginx-custom /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=nginx-custom:nginx-custom nginx.conf /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx-custom

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
