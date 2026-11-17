# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "server.js"]
