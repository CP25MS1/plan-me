FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./

RUN npm install

COPY . .
ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV PORT=3000
ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
