FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./

RUN npm install

COPY . .

ARG BASE_PATH
ARG NEXT_PUBLIC_BACKEND_URL
ENV BASE_PATH=${BASE_PATH}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV PORT=3000
ARG BASE_PATH
ARG NEXT_PUBLIC_BACKEND_URL
ENV BASE_PATH=${BASE_PATH}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
