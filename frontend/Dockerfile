FROM node:20-bullseye-slim AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./

RUN npm install --omit=optional --no-fund --loglevel=warn

COPY . .
ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static/ ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
