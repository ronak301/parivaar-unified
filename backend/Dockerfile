FROM node:20-alpine

WORKDIR /app

# Copy package files (from backend/ folder, build context is monorepo root)
COPY backend/package*.json ./

# Copy shared package
COPY packages/shared /app/packages/shared

# Install all dependencies (including dev for TypeScript)
RUN npm install --include=dev

# Copy backend source code
COPY backend/ .

# Build TypeScript
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
