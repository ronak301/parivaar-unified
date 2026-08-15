FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../packages/shared ./packages/shared

# Install all dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
