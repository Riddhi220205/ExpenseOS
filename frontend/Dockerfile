# ─── Stage 1: Build ──────────────────────────────────────────────────────────
# For a plain HTML/CSS/JS frontend there's nothing to compile,
# so we go straight to the nginx serving stage.

FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy our app files
COPY index.html /usr/share/nginx/html/index.html

# Custom nginx config for SPA + reverse-proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
