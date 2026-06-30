FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

RUN npx prisma generate

COPY backend/ .

EXPOSE 5000

CMD ["node", "server-fly.js"]
