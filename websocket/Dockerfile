FROM oven/bun:latest
WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY src ./src

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "src/index.ts"]
