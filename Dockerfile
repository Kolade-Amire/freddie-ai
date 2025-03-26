# Base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

RUN apk add --no-cache python3 make g++ sqlite

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

RUN mkdir -p public && chown -R node:node public
COPY public ./public

# Build TypeScript
RUN npx tsc

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache python3 make g++ sqlite
COPY package*.json ./
RUN npm install --production


# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public


# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/index.js"]