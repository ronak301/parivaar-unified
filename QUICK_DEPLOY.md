# Quick Deploy (No Manual Config Needed)

## On Your VM - One Command:

```bash
cd /path/to/parivaar-web-unified/backend
bash deploy.sh
```

That's it! The script handles everything:
- ✅ Creates `.env` file with all credentials
- ✅ Checks for `firebase-service-account.json`
- ✅ Stops old containers
- ✅ Builds and starts Docker
- ✅ Tests if API is running
- ✅ Shows you what to do next

## What the Script Does

1. Creates `.env` with MongoDB + Redis + Firebase config
2. Pulls `firebase-service-account.json` (you copy this once)
3. Starts Docker containers on port 3002
4. Tests if everything is working
5. Shows you the next steps

## Before You Run

Just need to copy ONE file to VM:
```bash
scp backend/firebase-service-account.json user@api.parivaarapp.in:/path/to/parivaar-web-unified/backend/
```

Then run the deploy script above. Done! 🚀

## Result

- **Port 3001**: Old API (community-backend) - Mobile users ✅
- **Port 3002**: New API (parivaar-web-unified) - Web admin ✅
- **Both running**: Zero downtime, no migration needed

## If Something Goes Wrong

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Run deploy again
bash deploy.sh
```

That's all you need to know! 🎯
