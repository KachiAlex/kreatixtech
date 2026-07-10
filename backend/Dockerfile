FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
