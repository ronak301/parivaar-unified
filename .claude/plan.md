# ParivaarApp — Full Rebuild Plan

## Context

ParivaarApp is a community management platform for Jain communities (directory, family trees, businesses, matrimonial). The current system runs on Postgres/Sequelize backend, an old Expo/RN mobile app, and a partially-built Next.js admin portal. We're doing a ground-up rebuild moving to MongoDB, with three deployables in one monorepo:

1. **`backend/`** — Express + Mongoose + MongoDB (replacing old Postgres/Sequelize)
2. **`mobile/`** — Fresh Expo app
3. **`web-admin/`** — Fresh Next.js admin portal (shadcn/ui)

**Key decisions confirmed**: MessageCentral + Redis for OTP, Firebase Storage for photos/biodata, Docker deploy on friend's VM, v1 with plain text search (AI search later), Postgres→Mongo migration out of scope for now, marketing site dropped (add back later), all config/localities/feature flags in MongoDB (no Firebase Remote Config).

---

## MongoDB Schema (9 Collections)

### `users` (member profiles)
- Identity: enrollmentId (unique, auto-generated random 8-digit number, stable — persists even if phone number changes; the primary external-facing ID)
- Core fields: firstName, lastName, fullName, profilePicture, guardianName, dob, weddingDate, isMarried, gender, phone (unique sparse — can change), email, education, specialEducation, bloodGroup, hobbies, achievements, nativePlace, nativeDistrict, nanihaal, aadharLast4
- **Address EMBEDDED** (1:1, always co-fetched): { fullAddress, state, city, district, pincode, locality }
- Family graph: familyId (ref→families), isFamilyHead, fatherId, motherId, spouseId, childrenIds[]
- Privacy: privateFields[] (field names hidden from non-self/non-admin)
- Status: isAlive (default true), demiseDate
- Auth: role (`super_admin` | `community_admin` | `member`), communityIds[]
- Indexes: phone (unique sparse), text index on names, communityIds, familyId

### `families`
- headId (ref→users), sampradaya (`Terapanthi` | `Sthanakvasi`), communityIds[]

### `communities`
- name, description, logo, contactPersonName, contactPersonNumber, state, city, status, type
- designations: [{ name, sansthan, designation, year }] (embedded, bounded)
- showFamilyMembers: `ALL` | `SINGLE` | `SPOUSE` | `SPOUSE_AND_KIDS`
- features: { welcomeScreen, aboutScreenExtraInfo, showOnlyHeadsInAllMembers }
- localities[] (array of strings — replaces old hardcoded constants)

### `businesses` (separate from users — needs independent search/filter)
- ownerId, communityId, name, category, phone, website, description, address (free text)
- instagramProfile, linkedinProfile, photos[] (max 2), logo, googleMapsLink

### `matrimonialProfiles`
- userId, communityId, biodataFile (URL), status (pending/approved/rejected)

### `businessEnquiries`
- userId, communityId, requirement, place, status

### `businessPromotions`
- businessId, userId, communityId, name, place, photo, description, validity, amount, status

### `approvalRequests` (generic maker-checker — build once, reuse everywhere)
- entityType: `profile_edit` | `matrimonial` | `business_enquiry` | `business_promotion` | `new_member` | `death_marking` | `family_head_change`
- entityId (polymorphic), communityId, requestedBy, reviewedBy, status, payload (the diff/data)

### `notifications`
- userId (recipient), communityId, type, title, body, data, approvalRequestId, isRead

---

## Monorepo Structure

```
parivaar-web-unified/
├── packages/shared/          # Shared types, constants, Zod validation schemas
│   └── src/{types,constants,validation}/
├── backend/                  # Express + Mongoose API
│   └── src/{config,models,routes,controllers,services,middlewares,utils,cron}/
├── mobile/                   # Expo app (ParivaarApp)
│   ├── app/                  # Expo Router file-based routes
│   └── src/{api,components,modules,stores,hooks,types,utils}/
├── web-admin/                # Next.js admin portal (shadcn/ui)
│   └── src/{app,components,lib,hooks}/
├── archive/                # Old apps kept for archival reference (old mobile app + old backend/admin code)
└── package.json              # npm workspaces root (marketing site dropped for now)
```

---

## Phased Build Order

### Phase 1: Foundation (Week 1-2)

#### 1A. Shared Package + Backend Core (Week 1)

**`packages/shared/`** — Types, constants, Zod schemas shared across all 3 apps
- Port constants from `archive/mobile-app-old/src/utils/constants.ts` (BloodGroups, BusinessTypes, Gender, RelationshipTypes, CommunityTypes)
- Zod schemas for user create/update, business, auth (reusable in backend validation AND mobile forms)
- TypeScript interfaces for all 9 collections

**`backend/` models** — All 9 Mongoose schemas
- Key difference from old Sequelize: Address embedded in User (was separate table), family graph via direct refs (was junction table), communityIds[] array (was CommunityMember junction table)
- Port & fix: move JWT secret, Expo push token from hardcoded values to env vars

**`backend/` auth system** — Fix the critical auth gap (old middleware existed but was never applied to routes)
- `middlewares/authenticate.ts` — JWT verification, attach user to req
- `middlewares/authorize.ts` — Role-based access check
- `middlewares/communityScope.ts` — Ensure non-super-admin can only access own communities
- `controllers/auth.ts` — Port MessageCentral OTP flow from `backend/controllers/user.js:183-474`, generate JWT with proper expiry (not the hardcoded year-2030 exp)
- Redis config: keep the dual-mode pattern (in-memory fallback for dev) from `backend/config/redis.js`

**`backend/` core CRUD APIs**
- Users: CRUD, search (replace Sequelize `Op.iLike` with MongoDB `$regex`/`$text`), birthday/anniversary events (replace SQL injection-vulnerable `Sequelize.literal` with safe `$expr`/`$month`/`$dayOfMonth`)
- Families: CRUD, get tree, reassign head
- Communities: CRUD, member list with filters + pagination

**`backend/` entry** — Express app with `/api/` prefix, CORS restricted to known origins, `authenticate` middleware on all routes except `/api/auth/*`

**`backend/docker-compose.yml`** — Add MongoDB and Redis services alongside app

#### 1B. Mobile & Web Admin Scaffolds (Week 2)

**`mobile/`** — Fresh Expo app with Expo Router
- Navigation shell: unauthenticated (login) → authenticated (5 bottom tabs: Directory, Explore, Business, Matrimonial, Profile)
- Zustand stores (auth, community, search) replacing old Redux
- API client with auth token interceptor
- Login flow: port OTP auto-submit + platform autofill from old `EnterOtp.tsx`

**`web-admin/`** — Fresh Next.js app with shadcn/ui
- Copy shadcn components from existing `src/components/ui/`
- Admin login (port 2-step phone/OTP from existing `admin-login-form.tsx`)
- Session management (httpOnly cookie, port from existing `lib/auth/session.ts`)
- Dashboard page with communities table

### Phase 2: Core Features (Week 3-4)

#### 2A. Directory + Family (Week 3)

**Backend**: Member search with filters (blood group, locality, business category, age range, gender, sampradaya) + pagination. Port filter logic from `backend/services/community.js:223-371` to Mongoose aggregation.

**Mobile**: 
- Directory screen with TabView (About, Today, All Members, Committee, Matrimonial) — port pattern from old app
- Members list with infinite scroll (keep `onEndReached` + `onMomentumScrollEnd` guard pattern)
- Filter screen with blood group bubbles, age slider, dropdowns
- Member detail screen with family tree view (respects community `showFamilyMembers` setting)
- Search screen with debounced input

**Mobile profile**:
- Schema-driven edit form — port the `FIELDS` array + `getElement()` pattern from old `EditProfileScreen.tsx` (this is elegant and saves massive code)
- **Critical change**: member edits create ApprovalRequest instead of direct save; OTP re-verification before edit submission

**Admin**: Community detail tabs (Members, Info, Executives, Localities, Approvals), member detail view

#### 2B. Approvals & Notifications (Week 4)

**Backend**: Generic approval service — `createApprovalRequest()` → notifies community admins; `reviewApprovalRequest()` → applies changes if approved + notifies requester

**Backend**: Push notifications via Expo SDK (port chunking pattern from `backend/utils/notification.js`, move hardcoded access token to env var)

**Admin**: Approval queue — list pending requests, show diff preview, approve/reject buttons

**Mobile**: Notifications feed screen

### Phase 3: Extended Features (Week 5-6)

#### 3A. Business & Matrimonial (Week 5)

**Backend**: Business CRUD + search/filter, enquiries, promotions APIs

**Mobile**:
- Business screen — two top tabs (Promoted / All), search + filter. Port the `ExcludeBusiness` denylist pattern from old app.
- Business detail screen with photos, Google Maps link, contact
- Matrimonial screen — search/filter by age, gender. Biodata viewer (PDF/JPEG)
- Explore tab — aggregated widgets (top matrimonial, business enquiries, search widget)
- Floating Action Button (bottom-right) with menu: Add Matrimonial Candidate, Add Business Enquiry, Add Business Promotion — all create approval requests

#### 3B. Events & Today (Week 6)

**Backend**: Birthday/anniversary events API (safe Mongoose aggregation replacing old SQL-injected query), birthday wish with push notification, birthday cron (daily at 8 AM IST, replacing the no-op placeholder)

**Mobile**: Today screen with birthday cards + confetti animation (port Lottie pattern), wish tracking via Zustand date-keyed state

### Phase 4: Polish (Week 7-8)

- Privacy controls (per-field public/private, enforced in API responses)
- Death marking + family head reassignment flow (with approval)
- Admin CSV/Excel export of member lists
- Per-community feature flags + localities + lookup lists all from MongoDB community doc (no Firebase Remote Config)
- Testing + bug fixes

---

## Patterns to Reuse

| Pattern | Source | What to Keep |
|---------|--------|-------------|
| Schema-driven forms | `archive/mobile-app-old/.../EditProfileScreen.tsx` | FIELDS array + getElement() switch |
| OTP autofill | `archive/mobile-app-old/.../EnterOtp.tsx:131-132` | `textContentType: "oneTimeCode"` (iOS), `autoComplete: "sms-otp"` (Android) |
| Infinite scroll guard | `archive/mobile-app-old/.../MembersList.tsx:188-193` | onEndReached + onMomentumScrollEnd |
| MessageCentral OTP | `backend/controllers/user.js:183-474` | Send/verify API flow, rate limiting |
| Redis dual-mode | `backend/config/redis.js` | In-memory fallback when REDIS_ENABLED unset |
| Push notification chunks | `backend/utils/notification.js` | Expo SDK chunking + receipt polling |
| Admin login form | `src/components/admin/admin-login-form.tsx` | 2-step phone/OTP UI |
| Session cookie | `src/lib/auth/session.ts` | httpOnly cookie pattern |
| shadcn/ui components | `src/components/ui/*` | All existing UI primitives |

## Security Fixes (Non-Negotiable, Phase 1)

1. JWT secret hardcoded in `backend/controllers/user.js:413` → env var `JWT_SECRET`
2. Expo push token hardcoded in `backend/utils/notification.js:3` → env var `EXPO_ACCESS_TOKEN`
3. Auth middleware defined but NEVER applied to any route → apply to all protected routes
4. JWT never expires (hardcoded `exp: 1920072200` / year 2030) → `expiresIn: '30d'`
5. CORS set to `*` → restrict to known origins
6. SQL injection in birthday query (`Sequelize.literal` with interpolation) → safe Mongoose aggregation
7. No authorization/community scoping → role-based middleware on every route

---

## Verification Plan

1. **Backend**: Test each API group with curl — auth (send OTP, verify, get JWT), users (CRUD, search, filter), communities, families, businesses, approvals
2. **Mobile**: Run on iOS/Android simulator — login flow, browse directory, view profiles, submit edit (triggers approval), business/matrimonial browse
3. **Web Admin**: Run dev server — admin login, community management, approval queue (approve/reject), member detail/edit, CSV export
4. **Integration**: Member edits profile on mobile → approval request created in DB → admin sees in web portal queue → approves → member gets push notification → profile updated on next fetch
