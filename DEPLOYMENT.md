# Parivaar Deployment Guide

## Backend Deployment (Docker)

### On Your VM (api.parivaarapp.in)

1. **SSH into your VM:**
```bash
ssh user@api.parivaarapp.in
```

2. **Clone/update the repo:**
```bash
cd /path/to/parivaar
git pull origin main
```

3. **Ensure docker-compose.prod.yml is present:**
```bash
cd backend
ls docker-compose.prod.yml
```

4. **Create/update .env file with your credentials:**

Copy your existing `.env` file to the VM (it has real credentials):
```bash
scp backend/.env user@api.parivaarapp.in:/path/to/backend/
```

Or manually create/update:
```bash
nano backend/.env
```

Make sure it includes:
- `MONGODB_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — your JWT secret
- `FIREBASE_SERVICE_ACCOUNT_PATH` — path to firebase credentials
- `CORS_ORIGINS` — add your domain names
- `DEV_OTP_BYPASS=true` or `false` as needed
```

5. **Make sure firebase-service-account.json exists:**
```bash
ls firebase-service-account.json
# If not, copy it from your local machine:
# scp firebase-service-account.json user@api.parivaarapp.in:/path/to/backend/
```

6. **Stop old containers (if any):**
```bash
docker-compose -f docker-compose.prod.yml down
```

7. **Start with Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

8. **Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Verify Backend is Running

```bash
curl http://api.parivaarapp.in:3001/api/communities
# Should return JSON response
```

---

## Frontend Deployment (Netlify)

1. **Update environment variable in Netlify:**
   - Go to Netlify Dashboard
   - Select your site
   - Build & deploy → Environment
   - Add/Update: `NEXT_PUBLIC_API_BASE_URL=https://api.parivaarapp.in/api`

2. **Trigger redeploy:**
   - Push to main branch OR
   - Manually redeploy from Netlify dashboard

3. **Test login:**
   - Visit https://parivaarapp.in
   - Login with: 9999999999 / 000000
   - Should redirect to admin panel

---

## Monitoring

```bash
# Check if containers are running
docker ps | grep parivaar

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart if needed
docker-compose -f docker-compose.prod.yml restart

# Update and restart
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

**API not responding:**
```bash
# Check if port 3001 is open
netstat -an | grep 3001

# Check container logs
docker-compose -f docker-compose.prod.yml logs app
```

**Database connection issues:**
```bash
# Test MongoDB connection
docker exec parivaar-app node -e "require('mongoose').connect(process.env.MONGODB_URI)"

# View mongo container logs
docker logs parivaar-mongo
```

**Redis issues:**
```bash
docker logs parivaar-redis
```
