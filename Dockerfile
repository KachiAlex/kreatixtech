FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install

RUN npx prisma generate

COPY backend/ .

EXPOSE 5000

CMD ["npm", "start"]
