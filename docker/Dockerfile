# Multi-stage Dockerfile for React + Convex productivity app

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Stage 2: Development
FROM node:20-alpine AS development
WORKDIR /app

# Install necessary tools for development
RUN apk add --no-cache git

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose development server port
EXPOSE 3000

# Development command
CMD ["npm", "start"]

# Stage 3: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Configure nginx to run as non-root
RUN touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html

# Create script to replace environment variables at runtime
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'for file in /usr/share/nginx/html/static/js/*.js; do' >> /docker-entrypoint.sh && \
    echo '  if [ -f "$file" ]; then' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_CONVEX_URL_PLACEHOLDER|${REACT_APP_CONVEX_URL}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_AUTH0_DOMAIN_PLACEHOLDER|${REACT_APP_AUTH0_DOMAIN}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_AUTH0_CLIENT_ID_PLACEHOLDER|${REACT_APP_AUTH0_CLIENT_ID}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_AUTH0_AUDIENCE_PLACEHOLDER|${REACT_APP_AUTH0_AUDIENCE}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_AUTH0_REDIRECT_URI_PLACEHOLDER|${REACT_APP_AUTH0_REDIRECT_URI}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '    sed -i "s|REACT_APP_AUTH0_DB_CONNECTION_PLACEHOLDER|${REACT_APP_AUTH0_DB_CONNECTION}|g" "$file"' >> /docker-entrypoint.sh && \
    echo '  fi' >> /docker-entrypoint.sh && \
    echo 'done' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx with environment variable substitution
ENTRYPOINT ["/docker-entrypoint.sh"]