# Dockerfile pentru React/Vite Dashboard - OPTIMIZED
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# ============================================
# Stage 1: Install dependencies with cache
# ============================================
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install with cache mount
RUN --mount=type=cache,id=npm-dashboard,target=/root/.npm \
    npm ci --prefer-offline

# ============================================
# Stage 2: Build the application
# ============================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

# Copy only source files (not node_modules)
COPY package*.json ./
COPY vite.config.* ./
COPY index.html ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src
COPY public ./public

# Copy environment file for Vite build
COPY .env* ./

# Set base path for production (served at /dashboard/)
ENV VITE_BASE_PATH=/dashboard/

# Build
RUN npm run build

# ============================================
# Stage 3: Production with nginx (minimal)
# ============================================
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
