# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# Copy dependency files first (layer caching)
COPY package*.json ./
 
# Install all deps (including dev for build)
RUN npm ci --only=production
 
# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
 
# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init
 
# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
 
WORKDIR /app
 
# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
 
# Copy application source
COPY server.js ./
 
# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R appuser:appgroup /app
 
# Switch to non-root user
USER appuser
 
# Expose API port
EXPOSE 5000
 
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1
 
# Start with dumb-init for proper PID 1 handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]