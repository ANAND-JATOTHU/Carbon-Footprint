# ============================================================
# Stage 1 — Build the React app
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package*.json ./

# Install dependencies (ci = clean, reproducible install)
RUN npm ci

# Copy all source files
COPY . .

# Build production bundle
RUN npm run build

# ============================================================
# Stage 2 — Serve with lightweight Nginx
# ============================================================
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Run nginx in foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
