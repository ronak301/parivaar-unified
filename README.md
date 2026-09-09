# Parivaar

Community directory platform for Indian community organisations (samaj/sabha). One codebase serves three audiences:

- **Admin portal** (`/admin`) — community admins manage members, families, businesses, matrimonial profiles, approvals and notifications.
- **Member app** (`/m`) — a mobile-first PWA where members log in via OTP, browse the directory, businesses and community feed, and edit their own profile.
- **Public family form** (`/community/:id/form`) — anyone can submit their family for admin approval without an account.

Live: admin + member app on Netlify, API at `https://api.parivaarapp.in`.

## Repository layout

```
parivaar-web-unified/
├── backend/          Express + Mongoose API (Node 20, TypeScript). Docker on a VM behind Caddy + Cloudflare tunnel.
├── web-admin/        Next.js app: admin portal, member app and public form. Deployed on Netlify.
├── packages/shared/  @parivaar/shared — types, zod validation schemas and constants shared by both.
├── scripts/          deploy helpers
├── .github/workflows deploy-backend.yml (auto-deploy on push), diagnose-backend.yml (read-only VM checks)
└── archive/          earlier React Native / Supabase attempts, kept for reference only
```

npm workspaces; the shared package must be built before either app type-checks.

## Getting started

```bash
npm run ready          # npm install + build @parivaar/shared
cp web-admin/.env.example web-admin/.env.local   # BACKEND_URL=http://localhost:3001 for local
# backend/.env needs MONGODB_URI, JWT_SECRET, SMS provider keys (see backend/docker-compose.prod.yml for the full list)
npm start              # backend on :3001, web-admin on :3000 (concurrently)
```

Admin login on local: `9999999999` / `12345`. Member app: `http://localhost:3000/m/login`.

All browser → backend traffic goes through Next.js API routes under `web-admin/src/app/api/**`; the browser never calls the backend directly. Keep it that way when adding endpoints.

## Feature summary

### Auth & access
- Per-community admin logins (bcrypt-hashed credentials) and a `super_admin` role that can switch between communities from the top bar and create new ones.
- Member login via phone OTP. Admins can generate a 3-minute OTP for members who cannot receive SMS (`/admin/otp`).
- Every community-scoped route is guarded server-side (`communityScope` middleware) so an admin can only read/write their own communities.

### Members & families (admin)
- Members directory with search and server-side filters: gender, blood group, locality (multi-select), marital status, business category, age range, special education, family-heads-only. Export the filtered list as PDF or CSV.
- Family tree management: add a family (head + members with relations, incl. sibling families), edit, cascade delete with a preview of affected descendants, mark a member deceased (auto-transfers family head), change family head.
- Phone-number validation and uniqueness enforced across the platform; gender mandatory for every member.
- Executive committee per community with photos pulled from linked member profiles.

### Public submissions & approvals
- Public family form (`/community/:id/form`) with phone-uniqueness gate and image upload. Submissions land in an approvals queue; admins approve/reject with notes. Orphaned images from rejected submissions are cleaned up periodically.
- Same approval pipeline is reused for member-initiated business listings, business enquiries and matrimonial profiles submitted from the member app.

### Businesses
- Business directory per community with ranked, typo-tolerant, Hinglish-aware search ("kapda", "CA", "car repair").
- Listing endpoint hides placeholder records left over from migration (no name/contact, or non-business types like Home Maker) and sorts named businesses first. Category counts endpoint powers the member-app filter.
- Owner phone is redacted when the owner has opted out of sharing it.

### Matrimonial
- Free-form candidate profiles (name, photo, biodata document, DOB, gender, qualification) — not tied to a member record. Biodata uploads skip the image cropper so the full document is kept.

### Community feed (member app)
- Unified feed of approved businesses, business enquiries and matrimonial profiles, with a composer for members to submit their own. Admins can remove items.

### Member app (`/m`)
- Mobile-first, design-token based UI (`web-admin/src/app/m/theme.css`).
- Directory with infinite scroll, full-page filters, member detail, executives tab, community info.
- Business directory with infinite scroll and a bottom-sheet category filter backed by server-side counts.
- Profile view/edit (OTP-verified).

### Data migration
- `backend/src/scripts/migrate-from-supabase.ts` moved Terapanth Sabha Udaipur (≈6.5k members, families, businesses, localities, executives) from the legacy Supabase system into MongoDB.

## Backend API (high level)

| Prefix | Purpose |
|---|---|
| `/auth` | check-phone, send/verify OTP, admin-login, me, admin-generate-otp |
| `/users` | search with filters, detail, update, mark-death, change-head, export |
| `/families` | CRUD, tree, cascade delete |
| `/communities` | CRUD, localities, executives, admin credentials, status |
| `/businesses` | list (paginated, filtered, searchable), category counts, detail, CRUD, enquiries, promotions, member submit |
| `/matrimonial` | list, detail, create, delete |
| `/feed` | community feed, my submissions, remove |
| `/approvals` | public submit, list, create, review |
| `/notifications` | list, mark read |
| `/localities` | suggestions (internet-backed) |

Models: `User`, `Family`, `Community`, `Business`, `BusinessEnquiry`, `BusinessPromotion`, `MatrimonialProfile`, `FeedItem`, `ApprovalRequest`, `Notification`.

## Deployment

**Frontend** — Netlify, auto-deploys from `main`. `BACKEND_URL` is set in `netlify.toml`; Next.js API routes run via `@netlify/plugin-nextjs`.

**Backend** — Docker Compose on the VM (`backend/docker-compose.prod.yml`, env vars tracked there). Caddy terminates TLS for `api.parivaarapp.in`; a Cloudflare tunnel fronts Caddy. `.github/workflows/deploy-backend.yml` SSHes in and runs `backend/deploy.sh` (git pull → rebuild → restart) on every push that touches `backend/**`. Changes only under `packages/shared` do not trigger it — push a backend change or run `backend/redeploy.sh` on the VM.

Gotchas learned the hard way:
- `BACKEND_URL` must be the Caddy host (`https://api.parivaarapp.in`), never the raw Docker port.
- The cloudflared tunnel's own `config.yml` ingress must point at `caddy`, not directly at a backend container, otherwise Caddyfile changes appear to have no effect.
- `diagnose-backend.yml` is a read-only workflow you can trigger to inspect containers, Caddy config and tunnel logs without SSH.

See `DEPLOYMENT.md`, `AUTO_DEPLOY.md` and `QUICK_DEPLOY.md` for step-by-step instructions.

## Development notes

- Shared validation lives in `packages/shared/src/validation` (zod); backend controllers `safeParse` request bodies against these, and the frontend reuses the same schemas.
- Constants such as `BusinessTypes`, `ExcludeBusinessTypes`, `BloodGroups`, relationship types and business search synonyms are in `packages/shared/src/constants`.
- `CLAUDE.md` / `AGENTS.md` carry project conventions for AI-assisted work; `AGENTS.md` is regenerated by `next dev`.
