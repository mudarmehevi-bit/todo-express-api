FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "server.js"]
