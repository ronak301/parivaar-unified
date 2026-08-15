# Parivaar Deployment Guide

## Architecture

```
OLD SYSTEM (Keep Running - Mobile App Users)
api.parivaarapp.in:3001 → /apps/ronak/community-backend (Node.js + Supabase)

NEW SYSTEM (Deploy New - Web Admin)
api.parivaarapp.in:3002 → /apps/ronak/parivaar-web-unified/backend (Node.js + MongoDB + Redis)
```

Both run in parallel. Old users unaffected. Migrate whenever ready.

---

## Backend Deployment (Docker)

### On Your VM

1. **SSH into your VM:**
```bash
ssh ubuntu@144.24.147.134
```

2. **Clone/update the repo:**
```bash
cd /apps/ronak
git clone https://github.com/ronak301/parivaar-unified.git parivaar-web-unified
# OR if already cloned:
cd parivaar-web-unified
git pull origin main
```

3. **Navigate to backend:**
```bash
cd /apps/ronak/parivaar-web-unified/backend
```

4. **Copy your .env file from local machine:**
```bash
# From your local machine:
scp backend/.env ubuntu@144.24.147.134:/apps/ronak/parivaar-web-unified/backend/
```

5. **Copy firebase credentials:**
```bash
# From your local machine:
scp backend/firebase-service-account.json ubuntu@144.24.147.134:/apps/ronak/parivaar-web-unified/backend/
```

6. **Run the deploy script (handles everything):**
```bash
# On VM:
bash deploy.sh
```

The script will:
- ✅ Check .env and firebase files exist
- ✅ Stop old containers
- ✅ Build and start Docker on port 3002
- ✅ Test API health
- ✅ Show you next steps

### Verify Backend is Running

```bash
# New API on port 3002 (your new system)
curl http://api.parivaarapp.in:3002/api/communities
# Should return JSON response

# Old API still works on port 3001 (community-backend)
curl http://api.parivaarapp.in:3001/api/communities
# Still returns data - mobile users unaffected
```

---

## Frontend Deployment (Netlify)

1. **Update environment variable in Netlify:**
   - Go to Netlify Dashboard
   - Select your site
   - Build & deploy → Environment
   - Add/Update: `NEXT_PUBLIC_API_BASE_URL=http://api.parivaarapp.in:3002/api`
   
   Or if using domain with reverse proxy:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api-v2.parivaarapp.in/api
   ```

2. **Trigger redeploy:**
   - Push to main branch OR
   - Manually redeploy from Netlify dashboard

3. **Test login:**
   - Visit https://parivaarapp.in
   - Login with: 9999999999 / 000000
   - Should redirect to admin panel

---

## Running Both Systems Safely

### Summary
- **Port 3001**: api.parivaarapp.in:3001 → `/apps/ronak/community-backend` (old system)
  - Status: Running (mobile app users)
  - Location: `/apps/ronak/community-backend` with `docker-compose.yml`
  
- **Port 3002**: api.parivaarapp.in:3002 → `/apps/ronak/parivaar-web-unified/backend` (new system)
  - Status: Ready to deploy
  - Location: `/apps/ronak/parivaar-web-unified/backend` with `docker-compose.prod.yml`

### Check Both Are Running
```bash
# Old API on port 3001
curl http://api.parivaarapp.in:3001/health

# New API on port 3002
curl http://api.parivaarapp.in:3002/health

# Both should respond
```

### Zero Risk Deployment
- Old system **completely untouched** at `/apps/ronak/community-backend`
- New system deploys **separately** at `/apps/ronak/parivaar-web-unified/backend`
- Mobile users keep working on port 3001
- Web admin works independently on port 3002
- Migrate users whenever you're ready

---

## Monitoring

```bash
# Check if new containers are running
docker ps | grep parivaar

# View new API logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart if needed
docker-compose -f docker-compose.prod.yml restart

# Update and restart
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

**New API not responding (port 3002):**
```bash
# Check if port 3002 is open
netstat -an | grep 3002

# Check container logs
docker-compose -f docker-compose.prod.yml logs app
```

**Old API down (port 3001):**
```bash
# Contact your friend - it's on their VM
# Or check: curl http://api.parivaarapp.in:3001/health
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

---

## Future Migration (No Rush)

When ready to migrate users from old → new (weeks/months later):

1. **Set up data sync** between Supabase ↔ MongoDB
2. **Test with subset** of users using new API
3. **Gradually migrate** users to new system
4. **Sunset old API** once everyone is migrated

For now: **Both systems run in parallel, zero downtime, old users keep working!** ✅
