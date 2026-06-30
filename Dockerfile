FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Copy prisma schema BEFORE npm install so the postinstall script can find it
COPY backend/prisma ./prisma/

# Install dependencies (postinstall runs prisma generate automatically)
RUN npm install

# Copy the rest of the backend source
COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
