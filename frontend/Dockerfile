FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./

RUN npm install --omit=optional --no-fund --loglevel=warn

COPY . .

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}
RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV PORT=3000

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next/standalone /app/standalone
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

EXPOSE 3000
CMD ["node", "/app/standalone/server.js"]
