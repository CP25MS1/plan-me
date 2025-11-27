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

FROM node:20-alpine
WORKDIR /app

# copy build outputs + deps
COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next/standalone /app/standalone
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# app will listen on PORT env or default 3000
ENV PORT=3000

EXPOSE 3000
CMD ["node", "/app/standalone/server.js"]
