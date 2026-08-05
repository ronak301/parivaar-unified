## To Sync On AWS VM:

// locally Run project
npm run dev

- Step 1: SSH into the droplet
  ssh -i parivaar4.pem ec2-user@13.232.72.180

- Step 2:

```cmd
cd cloudflared_ronak/community-backend
```

- Step 3:

```cmd
git pull origin main
cd ..
```

- Step 4:

```cmd
sudo docker-compose up --build -d
```

## Backup Database

> run the comands one by one and enter pg password when asked

```bash
pg_dump  -U postgres -p 5432 -h db.vmkshebyuvhvgyiwqeqv.supabase.co  -Fc -a -f $(date +%Y-%m-%d_%H-%M).out
pg_dumpall -U postgres -p 5432 -h db.vmkshebyuvhvgyiwqeqv.supabase.co >> $(date +%Y-%m-%d_%H-%M).sql
```
