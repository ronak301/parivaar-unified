FROM node:20-alpine

WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./

# Pre-copy @parivaar/shared to node_modules (local monorepo package)
COPY packages/shared ./node_modules/@parivaar/shared

# Install dependencies (shared already in node_modules)
RUN npm install --include=dev

# Copy backend source code
COPY backend/ .

# Build TypeScript
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
