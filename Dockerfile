FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Copy package files and install deps first (layer cache)
COPY backend/package*.json ./
RUN npm install

# Copy prisma schema and generate client for the correct platform
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the backend source
COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
