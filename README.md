## To Sync On DigitalOcean Droplet:

- Step 1: SSH into the droplet

- Step 2:

```cmd
cd /home/community-backend/
```

- Step 3:

```cmd
git pull
```

- Step 4:

```cmd
docker compose up --build -d
```

## Backup Database

> run the comands one by one and enter pg password when asked

```bash
pg_dump  -U postgres -p 5432 -h db.vmkshebyuvhvgyiwqeqv.supabase.co  -Fc -a -f $(date +%Y-%m-%d_%H-%M).out
pg_dumpall -U postgres -p 5432 -h db.vmkshebyuvhvgyiwqeqv.supabase.co >> $(date +%Y-%m-%d_%H-%M).sql
```
