# Parivaar Deployment Guide

## Architecture

```
OLD SYSTEM (Keep Running - Mobile App Users)
api.parivaarapp.in:3001 → Old Node.js + Supabase (Friend's VM)

NEW SYSTEM (Deploy New - Web Admin)
api.parivaarapp.in:3002 → New Node.js + MongoDB + Redis (Your VM)
```

Both run in parallel. Old users unaffected. Migrate whenever ready.

---

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

7. **Start with Docker Compose (runs on port 3002):**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

8. **Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Verify Backend is Running

```bash
# New API on port 3002
curl http://api.parivaarapp.in:3002/api/communities
# Should return JSON response

# Old API still works on port 3001 (from friend's VM)
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
- **Port 3001** (old): api.parivaarapp.in:3001 → Supabase backend (friend's VM) - Mobile app ✅
- **Port 3002** (new): api.parivaarapp.in:3002 → MongoDB backend (your VM) - Web admin ✅

### Check Both Are Running
```bash
# Old API (friend's VM)
curl http://api.parivaarapp.in:3001/health

# New API (your VM)  
curl http://api.parivaarapp.in:3002/health

# Both should respond
```

### No Migration Yet
- Old users keep using port 3001 (completely unaffected)
- New web admin uses port 3002 (isolated environment)
- Zero downtime, zero risk
- Migrate users whenever you're ready (days/weeks/months later)

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
