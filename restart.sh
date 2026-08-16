#!/bin/bash

echo "Stopping v2 backend..."
docker-compose -f backend/docker-compose.prod.yml down

echo "Starting v2 backend..."
docker-compose -f backend/docker-compose.prod.yml up -d

echo "Waiting for backend to start..."
sleep 3

echo "Backend restarted! Testing..."
curl -s https://api.parivaarapp.in/v2/api/communities | jq .

echo ""
echo "✅ Done! Backend is running."
