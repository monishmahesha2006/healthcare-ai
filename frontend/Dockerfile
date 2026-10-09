# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_URL must be passed as a build-arg so it gets baked into the JS bundle
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production Stage ----
FROM nginx:1.25-alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config template: serve index.html for all routes (React SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Railway sets $PORT — use envsubst to inject it into default.conf inside conf.d
ENV PORT=80
EXPOSE ${PORT}

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
