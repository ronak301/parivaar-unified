#!/bin/bash

# Parivaar Backend Deployment Script
# Run this on your VM to deploy the new API on port 3002

set -e

echo "🚀 Parivaar Backend Deployment"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env found${NC}"
fi

# Check if firebase-service-account.json exists
if [ ! -f "firebase-service-account.json" ]; then
    echo -e "${YELLOW}⚠️  firebase-service-account.json not found${NC}"
    exit 1
else
    echo -e "${GREEN}✓ firebase-service-account.json found${NC}"
fi

# Stop existing containers (if any)
echo -e "\n${YELLOW}Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
echo -e "\n${YELLOW}Building and starting Docker containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
echo -e "\n${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check if API is responding
echo -e "\n${YELLOW}Testing API health...${NC}"
if curl -s http://localhost:3002/api/communities > /dev/null 2>&1; then
    echo -e "${GREEN}✓ New API running on port 3002${NC}"
else
    echo -e "${YELLOW}⚠️  API not responding yet, checking logs...${NC}"
    docker compose -f docker-compose.prod.yml logs app | tail -20
fi

# Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "API Status:"
echo "  Old API:  http://api.parivaarapp.in:3001  (community-backend)"
echo "  New API:  http://api.parivaarapp.in:3002  (parivaar-web-unified)"
echo ""
echo "Check logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Stop services:"
echo "  docker compose -f docker-compose.prod.yml down"
echo ""
