# -----------------------------
# Stage 1: Build Next.js app
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./
COPY . .

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

RUN npm install
RUN npm run build

# -----------------------------
# Stage 2: Production runtime (Nginx + Node)
# -----------------------------
FROM node:20-alpine

# Install Nginx
RUN apk add --no-cache nginx

# Create directories
WORKDIR /app
RUN mkdir -p /run/nginx

# Copy build output & config
COPY --from=builder /app /app
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80

# Start both Node (Next.js) and Nginx
CMD npm run start & nginx -g 'daemon off;'
