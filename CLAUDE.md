@AGENTS.md

## Deployment

- **Frontend (web-admin):** Deployed on Netlify. Auto-deploys on push to main.
- **Backend:** Runs in Docker behind Caddy reverse proxy on a VM. Env vars are in `backend/docker-compose.prod.yml` (tracked in git, no SSH needed to update).
- **BACKEND_URL** must use Caddy: `https://api.parivaarapp.in` — NOT the direct Docker port (`http://api.parivaarapp.in:3002`).
- Next.js API routes work on Netlify with `@netlify/plugin-nextjs`. The form and admin panel proxy all backend calls through these routes — don't bypass with direct browser calls or Netlify redirects.
- Admin login: `9999999999` / `12345`
