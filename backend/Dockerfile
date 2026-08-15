FROM node:20-alpine

WORKDIR /app

# Copy entire monorepo structure to preserve paths
COPY . .

# Install dependencies in backend folder
WORKDIR /app/backend
RUN npm install --include=dev

# Build TypeScript
RUN npm run build

# Remove dev dependencies for production
RUN npm prune --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
