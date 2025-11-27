FROM node:20-alpine AS builder
WORKDIR /app

# copy package + config
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./
COPY . .

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

# install & build
RUN npm install
RUN npm run build

# -----------------------
# Final image
# -----------------------
FROM node:20-alpine
WORKDIR /app

# copy build outputs + deps
COPY --from=builder /app/public /app/public
# Next standalone server (server.js + required files)
COPY --from=builder /app/.next/standalone /app/standalone

# copy the whole .next so static assets and other .next metadata are available
COPY --from=builder /app/.next /app/.next

# create symlink so standalone/server.js can find .next at /app/standalone/.next
# (ln -s may fail if it already exists; || true avoids build failure)
RUN ln -s /app/.next /app/standalone/.next || true

# copy node_modules and package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

# runtime port
ENV PORT=3000
EXPOSE 3000

# start server
CMD ["node", "/app/standalone/server.js"]
