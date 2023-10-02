FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update || : && apt-get install -y --no-install-recommends \
    python3 \
    build-essential && \
    rm -rf /var/lib/apt/lists/* && \
    npm install

COPY . .

EXPOSE 80

CMD [ "npm", "start" ]