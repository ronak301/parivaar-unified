FROM node:20-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install all workspace dependencies
RUN npm install --include=dev

# Build shared package first (backend depends on it)
WORKDIR /app/packages/shared
RUN npm run build

# Build backend (now shared is built and available)
WORKDIR /app/backend
RUN npm run build

# Clean dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
