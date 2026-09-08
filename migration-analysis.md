# Migration Plan: Supabase (PostgreSQL) → Parivaar MongoDB

## Source Database Summary

| Table | Rows | Description |
|---|---|---|
| `users` | 6,589 | All members across all communities |
| `addresses` | 6,176 | One address per user (1:1 via `user_id`) |
| `relationships` | 11,940 | Bidirectional family links (`user_id` ↔ `relative_id` + `type`) |
| `businesses` | 2,205 | One or more businesses per user |
| `community_members` | 6,579 | Join table: user ↔ community |
| `communities` | 8 | 6 are test/dev, 1 inactive, **1 real** |
| `executives` | 9 | Committee members (all in community 8) |
| `applicants` | 6,563 | Approval records (all APPROVED except 2 PENDING) |

### The Real Community

**Community ID 8 — "Terapanth Sabha Udaipur"** is the only production community:
- 6,549 members
- Description: "उदयपुर मे निवासरत जैन तेरापंथी परिवारों की संपर्क निदेशिका"
- Type: Jain, SubType: Terapanth, Status: Active
- `show_family_members`: ALL
- 9 executives with Hindi role names (अध्यक्ष, मंत्री, etc.)
- Logo: Firebase Storage URL

The other 7 communities (Test, Hierarchy Testing, React Testing, etc.) have 0-14 members — **skip these**.

Community 14 ("Oswal Bissa Samaj Karnataka") has 0 members and status Inactive — skip.

---

## Target MongoDB Models

| Model | Key Fields | Notes |
|---|---|---|
| `Community` | name, description, logo, city, state, status, designations[], localities{} | Single doc |
| `User` | enrollmentId, name, address{}, familyId, isFamilyHead, fatherId/motherId/spouseId/childrenIds/siblingIds, communityIds[] | One per person |
| `Family` | headId, sampradaya, communityIds[] | Groups related users |
| `Business` | ownerId, communityId, name, category, phone, etc. | Linked to User + Community |

---

## Field Mapping

### Community (1 document)

| Source (`communities` + `executives`) | Target (`Community`) |
|---|---|
| `name` = "Terapanth Sabha Udaipur" | `name` |
| `description` | `description` |
| `logo` (Firebase URL) | `logo` |
| — | `city` = "Udaipur" |
| — | `state` = "Rajasthan" |
| `status` = "Active" | `status` = "Active" |
| `executives` (9 rows with Hindi roles) | `designations[]` — map each to `{ id, memberId, name, designation, year }` |
| unique localities from `addresses` | `localities` = `{ "Udaipur": [...all unique locality values...] }` |

**Executives → Designations mapping:**
Each executive has `user_id` and `roles[]` (e.g. `{अध्यक्ष}`). Map to:
```
{
  id: nanoid(),
  memberId: <new MongoDB user _id>,
  name: <user's fullName>,
  designation: role string,
  year: "2023"  // from created_at year
}
```

### User (6,549 documents — only community 8 members)

| Source (`users` + `addresses`) | Target (`User`) |
|---|---|
| — (auto-generated) | `enrollmentId` (8-digit random) |
| `first_name` | `firstName` (trim) |
| `last_name` | `lastName` (trim) |
| `full_name` | `fullName` (recompute: firstName + lastName) |
| `profile_picture` | `profilePicture` (Firebase URL or null) |
| `guardian_name` | `guardianName` |
| `dob` | `dob` |
| `wedding_date` | `weddingDate` |
| `is_married` | `isMarried` (null → undefined) |
| `gender` ("Male"/"Female") | `gender` |
| `phone` | `phone` (normalize: strip spaces, ensure 10-digit) |
| `email` | `email` |
| `education` | `education` |
| `blood_group` ("B_POSITIVE" etc.) | `bloodGroup` (keep as-is, matches app enum) |
| `native_place` | `nativePlace` |
| `facebook_link` | — (no field in target, drop) |
| `instagram_link` | — (drop) |
| `linkedin_link` | — (drop) |
| `birth_time` | — (drop) |
| `blood_donor` | — (drop) |
| `number_of_times_blood_donated` | — (drop) |
| `is_account_manager` | — (drop) |
| `is_super_admin` | — (drop) |
| `landline` | — (drop) |
| `push_tokens` | `pushTokens` (carry over) |
| `approval_status` | — (all APPROVED, skip) |
| `parent_node` / `root_node` | Used to derive `familyId`, `isFamilyHead`, relationship refs |
| — | `role` = "member" |
| — | `communityIds` = [new community ObjectId] |
| — | `isAlive` = true |
| — | `showPhoneInCommunity` = true |
| — | `showBusinessInCommunity` = true |

**Address sub-document** (from `addresses` table):

| Source | Target (`address.{}`) |
|---|---|
| `full_address` | `fullAddress` |
| `state` | `state` |
| `city` | `city` |
| `pincode` | `pincode` |
| `locality` | `locality` |

### Family (1,671 documents)

Source uses `parent_node` / `root_node` UUIDs on the `users` table:
- `root_node` = the family head's UUID. All users sharing the same `root_node` belong to one family.
- `parent_node` = direct parent in the tree (null for the head).
- 1,671 distinct `root_node` values → 1,671 Family documents.

**Mapping:**
```
{
  headId: <MongoDB ObjectId of the root_node user>,
  sampradaya: "Terapanthi",  // community is Terapanth
  communityIds: [communityObjectId]
}
```

Each user gets `familyId` = their family's `_id`, and `isFamilyHead` = true if their source `id` equals their `root_node` and `parent_node` is null.

### Relationships → Structured Family References

The source `relationships` table has **free-form type strings** (121+ distinct values including Hindi, typos, case variations). These must be normalized into the target's structured refs:

| Normalized Relationship | Source Variations | Target Field |
|---|---|---|
| **Spouse** | "Spouse", "SPOUSE", "wife", "Wife", "WIFE", "Husband", "HUSBAND", "पति", "धर्मपत्नी", "पत्नि", "Wif", etc. | `spouseId` (bidirectional) |
| **Parent→Child** | "Son", "SON", "Daughter", "DAUGHTER", "Child", "पूत्र", "पोता", etc. | parent's `childrenIds[]` + child's `fatherId`/`motherId` |
| **Father/Mother** | "Father", "FATHER", "Mother", "MOTHER", "Maa", "पिता", "दादा" | child's `fatherId` / `motherId` |
| **In-law** | "Daughter in law", "DaughterInLaw", "Father in Law", "FatherInLaw", "बहू", "पुत्रवधू" | — (derive from spouse + parent links) |
| **Grandparent/Grandchild** | "Grand son", "GrandSon", "Grand Daughter", "GrandParent", "पौत्री", etc. | — (derive through parent chain) |
| **Sibling** | "Brother", "Sister" | `siblingIds[]` (bidirectional) |

**Strategy:**
1. Build a UUID→ObjectId lookup map for all 6,549 users.
2. Process `parent_node` first — this gives the tree structure:
   - If user has `parent_node`, set `parent_node_user.childrenIds.push(user)` and `user.fatherId` or `user.motherId` (based on parent's gender).
3. Process `relationships` table second — extract only:
   - **Spouse** relationships → set `spouseId` on both sides
   - **Sibling** relationships → set `siblingIds` on both sides
   - Skip grandparent/in-law/other — these are derivable from the tree
4. The `parent_node` tree is more reliable than the free-text relationships for parent-child links.

### Business (2,205 documents — community 8 owners only, ~2,193)

| Source (`businesses`) | Target (`Business`) |
|---|---|
| `owner_id` | `ownerId` (UUID → ObjectId via lookup) |
| — | `communityId` = community ObjectId |
| `name` | `name` |
| `type` ("HomeMaker", "Service", "SelfEmployed", "ClothMerchant", etc.) | `category` |
| `description` | `description` |
| `address` | `address` |
| `website` | `website` |
| `phone` | `phone` |
| `sub_type` | — (only 1 value, drop) |

---

## Data Quality Issues

### 1. Duplicate/junk phone numbers
- 3 users have `phone` = "नील" (Hindi for "nil") — treat as null
- Some phones may have spaces/formatting — normalize to 10-digit Indian format
- Phone is `unique: true` in MongoDB — must deduplicate. Check for real collisions.

### 2. Profile pictures
- Only 149 out of 6,589 users have `profile_picture`
- Format is Firebase Storage URLs — these will continue to work as long as the Firebase project lives
- `image_path` is a Firebase storage path (not a URL) — ignore it

### 3. Relationship type chaos
- 121+ distinct relationship type strings with inconsistent casing, Hindi/English mix, typos
- Strategy: normalize to a canonical enum, use `parent_node` tree as ground truth for parent-child

### 4. Blood group typos
- 6 entries as "A+" and 1 as "B+" instead of "A_POSITIVE"/"B_POSITIVE" — normalize
- "NEGETIVE" (typo) is used consistently — keep as-is since app already uses this spelling

### 5. Users without addresses
- 413 users (6,589 - 6,176) have no address row — their `address` will be `undefined`

### 6. Guardian name format
- Many use "S/O", "W/O", "D/O" prefix — keep as-is, matches app's usage

### 7. Community logo
- Firebase Storage URL with encoded timestamp — will work until Firebase project is deleted
- Consider: download and re-upload to own storage at some point

---

## Migration Steps (Execution Order)

### Phase 1: Prepare

1. **Create the migration script** at `backend/src/scripts/migrate-from-supabase.ts`
2. **Parse the SQL dump** — use a lightweight TSV parser on the COPY sections (tab-separated)
3. **Build lookup maps**: `sourceUUID → parsed user data`, `sourceUUID → address data`

### Phase 2: Community

1. Create the Community document:
   ```
   {
     name: "Terapanth Sabha Udaipur",
     description: "उदयपुर मे निवासरत जैन तेरापंथी परिवारों की संपर्क निदेशिका",
     logo: <firebase URL>,
     city: "Udaipur",
     state: "Rajasthan",
     status: "Active",
     designations: [],  // filled after users are created
     localities: { "Udaipur": [...unique localities from addresses...] }
   }
   ```

### Phase 3: Users

1. Filter to only community 8 member UUIDs (6,549 users)
2. For each user:
   - Generate `enrollmentId` (8-digit unique random)
   - Map fields per the table above
   - Merge address from the `addresses` table
   - Normalize phone numbers
   - Set `role: "member"`, `communityIds: [communityId]`
   - `insertMany` in batches of 500
3. Build `sourceUUID → mongoObjectId` map

### Phase 4: Families

1. Group users by `root_node` UUID → 1,671 families
2. For each family group:
   - Create `Family` doc with `headId` = ObjectId of the `root_node` user
   - Set `sampradaya: "Terapanthi"`, `communityIds: [communityId]`
3. Update each user with their `familyId`
4. Set `isFamilyHead: true` on head users (where source `parent_node` is null and `id` = `root_node`)

### Phase 5: Relationships

1. **Parent-child from `parent_node`:**
   - For each user with `parent_node`, look up the parent user
   - Based on parent's `gender`: set `fatherId` or `motherId` on the child
   - Add child to parent's `childrenIds[]`

2. **Spouse from `relationships` table:**
   - Filter to spouse-type relationships (Wife, Husband, Spouse, पति, धर्मपत्नी, etc.)
   - For each pair, set `spouseId` on both sides (skip if already set)

3. **Siblings from `relationships` table:**
   - Filter to Brother/Sister types
   - Add to `siblingIds[]` on both sides

4. **Bulk update** all users with their relationship fields

### Phase 6: Businesses

1. Filter businesses to community 8 member owners (2,193 businesses)
2. Map fields per table above
3. `insertMany` in batches of 500

### Phase 7: Executives → Designations

1. For each of the 9 executive rows (all community 8):
   - Look up the user's new MongoDB ObjectId and fullName
   - Create designation entry: `{ id, memberId, name, designation: role, year }`
2. Update the Community document's `designations[]`

### Phase 8: Verify

1. Count verification:
   - Users: expect ~6,549
   - Families: expect ~1,671
   - Businesses: expect ~2,193
   - Community designations: expect 9
2. Spot-check: pick 10 random families, verify tree structure
3. Verify no duplicate phones
4. Verify all familyId refs point to valid Family docs

---

## Relationship Type Normalization Map

```
SPOUSE: wife, Wife, WIFE, Wif, Husband, HUSBAND, Spouse, SPOUSE, Spous,
        Husband-Wife, पति, धर्मपत्नी, पत्नि

FATHER: Father, FATHER, "Father ", Grand father, GRANDFATHER,
        Father in law (skip - in-law), FatherInLaw (skip),
        पिता, दादा

MOTHER: Mother, MOTHER, Maa, Grand mother (skip - grand),
        Mother in law (skip)

SON: Son, SON, Sun, son, "Son ", Pota (grandson - skip)

DAUGHTER: Daughter, DAUGHTER, daughter, "Daughter ", Dayghter

SIBLING: Brother, Sister

DAUGHTER_IN_LAW: (skip — derive from spouse + parent)
SON_IN_LAW: (skip)
GRANDPARENT/GRANDCHILD: (skip — derive from parent chain)
IN_LAW: (skip — derive from spouse's parents)
```

Only **Spouse** and **Sibling** relationships need explicit migration. Parent-child comes from `parent_node`.

---

## Localities Extraction

All 6,176 addresses are predominantly Udaipur. Extract unique non-null locality values and store as:

```json
{
  "Udaipur": [
    "Aashirvaad Nagar", "Aayad", "Adarsh Nagar", "Adinath Nagar",
    "Ahinsapuri", "Ambamata", "Anand Nagar", "Ashok Nagar",
    "Ashok Vihar", "Bada Bazaar", "Badgaon", "Bedla",
    ... (100+ localities)
  ]
}
```

Normalize locality names: split camelCase to Title Case, trim, deduplicate.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Phone uniqueness conflict | Normalize phones first; skip null/"नील" phones; log conflicts |
| Firebase URLs expire | Download profile pictures to own storage (post-migration) |
| Relationship data loss | `parent_node` tree is reliable for hierarchy; free-text types are supplementary |
| 169 users without root_node | Create singleton families for these users (they are their own head) |
| 92 users without gender | Leave gender undefined; may affect father/mother assignment — log these |
| Hindi relationship types | Included in normalization map; test with sample data first |
| Script idempotency | Add `--dry-run` flag; clear collections before re-running |

---

## Open Questions (Minor — can proceed with defaults)

1. **Social links (facebook, instagram, linkedin):** The source has these but the target model doesn't. Drop them? Or add fields?
   - **Default:** Drop. Not critical for a community directory.

2. **Blood donor fields:** Source has `blood_donor` (bool) and `number_of_times_blood_donated`. Target doesn't.
   - **Default:** Drop. Can add later if needed.

3. **`show_family_members` = "ALL":** Source community has this flag. Target doesn't have this concept — all families are visible. No action needed.

4. **Community logo:** Keep Firebase URL for now. Plan to download/re-upload to own storage later.

5. **Applicants table:** 6,563 rows, all APPROVED. Since `approval_status` is on users already, skip this table — no pending approvals to track.

---

## Estimated Effort

| Task | Time |
|---|---|
| Write migration script | 2-3 hours |
| Parse + map data | included above |
| Relationship normalization logic | 30 min |
| Testing with dry-run | 30 min |
| Run migration + verify | 30 min |
| **Total** | **~4 hours** |

---

## File: `backend/src/scripts/migrate-from-supabase.ts`

The script should:
1. Read the SQL dump file
2. Parse COPY sections into in-memory arrays
3. Execute phases 2-8 above in order
4. Log progress and a summary at the end
5. Support `--dry-run` (parse + validate, don't write to DB)
6. Connect to MongoDB using the same `MONGODB_URI` from `.env`
