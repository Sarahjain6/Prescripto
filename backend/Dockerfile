# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# Render/most hosts inject PORT; default to 4000 for local docker-compose use
ENV PORT=4000
EXPOSE 4000

CMD ["node", "server.js"]
