FROM node:20-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Build shared package first (backend depends on it)
WORKDIR /app/packages/shared
RUN npm install --include=dev
RUN npm run build

# Then build backend
WORKDIR /app/backend
RUN npm install --include=dev
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
