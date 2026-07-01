FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Copy package files and prisma schema BEFORE npm install
# so the postinstall prisma generate script can find the schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies (postinstall runs prisma generate automatically)
RUN npm install

# Copy the rest of the backend source
COPY backend/ .

EXPOSE 5000

# Push schema changes to DB in background, then start server immediately
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate & node start.mjs"]
