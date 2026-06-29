FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/ .

EXPOSE 5000

CMD ["npm", "start"]
