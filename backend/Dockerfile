FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install && npx prisma generate --schema=prisma/schema.prisma

COPY . .

EXPOSE 5100

CMD ["node", "server.js"]
