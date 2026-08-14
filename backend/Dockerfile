FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY ../packages/shared ./packages/shared

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
