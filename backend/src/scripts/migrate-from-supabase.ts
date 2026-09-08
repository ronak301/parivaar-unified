/**
 * Migration script: Supabase PostgreSQL → Parivaar MongoDB
 *
 * Usage:
 *   npx tsx src/scripts/migrate-from-supabase.ts <path-to-backup.sql> [--dry-run]
 *
 * Requires MONGODB_URI in backend/.env
 */

import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';

dotenv.config();

// ── Models (import after dotenv so mongoose picks up env) ────────────────────
import Community from '../models/Community';
import User from '../models/User';
import Family from '../models/Family';
import Business from '../models/Business';

// ── Config ───────────────────────────────────────────────────────────────────

const SOURCE_COMMUNITY_ID = 8; // "Terapanth Sabha Udaipur"
const BATCH_SIZE = 500;
const DRY_RUN = process.argv.includes('--dry-run');

// ── Types ────────────────────────────────────────────────────────────────────

interface SourceUser {
  id: string; // UUID
  first_name: string;
  last_name: string | null;
  profile_picture: string | null;
  image_path: string | null;
  guardian_name: string | null;
  dob: string | null;
  bio: string | null;
  gender: string | null;
  education: string | null;
  native_place: string | null;
  phone: string | null;
  landline: string | null;
  wedding_date: string | null;
  email: string | null;
  auth_id: string | null;
  blood_group: string | null;
  is_account_manager: string;
  last_seen: string | null;
  is_super_admin: string | null;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  linkedin_link: string | null;
  birth_time: string | null;
  blood_donor: string | null;
  number_of_times_blood_donated: string | null;
  is_married: string | null;
  can_edit_family_members: string;
  parent_node: string | null;
  root_node: string | null;
  push_tokens: string | null;
  approval_status: string | null;
}

interface SourceAddress {
  id: string;
  user_id: string;
  full_address: string | null;
  pincode: string | null;
  city: string | null;
  locality: string | null;
  state: string | null;
}

interface SourceRelationship {
  id: string;
  user_id: string;
  relative_id: string;
  type: string;
}

interface SourceBusiness {
  id: string;
  owner_id: string;
  name: string | null;
  type: string | null;
  sub_type: string | null;
  description: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
}

interface SourceCommunity {
  id: string;
  name: string;
  logo: string | null;
  image_path: string | null;
  description: string;
  type: string;
  sub_type: string | null;
  status: string | null;
  code: string | null;
  created_at: string;
  updated_at: string;
  show_family_members: string | null;
}

interface SourceCommunityMember {
  id: string;
  community_id: string;
  user_id: string;
}

interface SourceExecutive {
  id: string;
  community_id: string;
  user_id: string;
  roles: string;
  created_at: string;
}

// ── SQL Parser ───────────────────────────────────────────────────────────────

function parseCopySection<T>(
  lines: string[],
  tableName: string,
  columns: string[],
): T[] {
  const header = `COPY public.${tableName} (`;
  let inSection = false;
  const rows: T[] = [];

  for (const line of lines) {
    if (!inSection) {
      if (line.startsWith(header)) {
        inSection = true;
      }
      continue;
    }
    if (line === '\\.') break;

    const values = line.split('\t');
    const row: Record<string, string | null> = {};
    for (let i = 0; i < columns.length; i++) {
      const val = values[i];
      row[columns[i]] = val === '\\N' ? null : val;
    }
    rows.push(row as T);
  }

  return rows;
}

// ── Normalization helpers ────────────────────────────────────────────────────

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-()]+/g, '');
  // Skip Hindi text like "नील"
  if (!/^[\d+]+$/.test(cleaned)) return null;
  // Strip country code prefix
  if (cleaned.startsWith('+91')) return cleaned.slice(3);
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned.slice(2);
  if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) return cleaned;
  // Return as-is if it looks like a phone number
  if (/^\d{7,}$/.test(cleaned)) return cleaned;
  return null;
}

function normalizeBloodGroup(bg: string | null): string | null {
  if (!bg) return null;
  const map: Record<string, string> = {
    'A+': 'A_POSITIVE',
    'B+': 'B_POSITIVE',
    'O+': 'O_POSITIVE',
    'AB+': 'AB_POSITIVE',
    'A-': 'A_NEGETIVE',
    'B-': 'B_NEGETIVE',
    'O-': 'O_NEGETIVE',
    'AB-': 'AB_NEGETIVE',
  };
  return map[bg] ?? bg;
}

// Known multi-word locality fragments that camelCase splitting misses
const LOCALITY_COMPOUNDS: Record<string, string> = {
  'aashirvaadnagar': 'Aashirvaad Nagar',
  'adarshnagar': 'Adarsh Nagar',
  'adinathnagar': 'Adinath Nagar',
  'anandnagar': 'Anand Nagar',
  'ashoknagar': 'Ashok Nagar',
  'ashokvihar': 'Ashok Vihar',
  'badabazaar': 'Bada Bazaar',
  'bedlaroad': 'Bedla Road',
  'benadebathedahouse': 'Benade Bathe Da House',
  'bohraganeshmarg': 'Bohra Ganesh Marg',
  'chetakcircle': 'Chetak Circle',
  'durganursery': 'Durga Nursery',
  'gordanvillas': 'Gordan Villas',
  'hazareshwarcolony': 'Hazareshwar Colony',
  'hiranmagrisector11': 'Hiran Magri Sector 11',
  'hiranmagrisector13': 'Hiran Magri Sector 13',
  'hiranmagrisector14': 'Hiran Magri Sector 14',
  'hiranmagrisector3': 'Hiran Magri Sector 3',
  'hiranmagrisector4': 'Hiran Magri Sector 4',
  'hiranmagrisector5': 'Hiran Magri Sector 5',
  'hiranmagrisector6789': 'Hiran Magri Sector 6-7-8-9',
  'kalkamataroad': 'Kalka Mata Road',
  'keshavnagar': 'Keshav Nagar',
  'maldasstreet': 'Maldas Street',
  'maryadanagar': 'Maryada Nagar',
  'mathokisehri': 'Matho Ki Sehri',
  'meeranagar': 'Meera Nagar',
  'morderncolony': 'Modern Colony',
  'motichohatta': 'Moti Chohatta',
  'navratnacomplex': 'Navratna Complex',
  'nehrubazaar': 'Nehru Bazaar',
  'newahinsapuri': 'New Ahinsapuri',
  'newbhupalpura': 'New Bhupalpura',
  'newnavratnacomplex': 'New Navratna Complex',
  'panchratnacomplex': 'Panchratna Complex',
  'paneriyokimadri': 'Paneriyo Ki Madri',
  'pathonkimagri': 'Pathon Ki Magri',
  'pratapnagar': 'Pratap Nagar',
  'roopsagarroad': 'Roopsagar Road',
  'sahelinagar': 'Saheli Nagar',
  'samtanagar': 'Samta Nagar',
  'sarvrituvillas': 'Sarvritu Villas',
  'sindhibazaar': 'Sindhi Bazaar',
  'subhashnagar': 'Subhash Nagar',
  'sukhadiyacircle': 'Sukhadiya Circle',
  'syphonchoraha': 'Syphon Choraha',
  'universityroad': 'University Road',
  'naiyokitalai': 'Naiyoki Talai',
  'ziniretchowk': 'Zinir Et Chowk',
  'mallatalai': 'Malla Talai',
  'oldcity': 'Old City',
  'pologround': 'Polo Ground',
  'shobhagpura': 'Shobhag Pura',
  'motimagri': 'Moti Magri',
};

function normalizeLocality(loc: string): string {
  const lower = loc.trim().toLowerCase();
  if (LOCALITY_COMPOUNDS[lower]) return LOCALITY_COMPOUNDS[lower];
  // Fallback: insert space before capitals in camelCase, title-case
  let s = loc
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2');
  s = s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return s.trim();
}

const SPOUSE_TYPES = new Set([
  'wife', 'husband', 'spouse', 'spous', 'wif',
  'husband-wife',
  'पति', 'धर्मपत्नी', 'पत्नि',
  'पत्नि ', // trailing space variant
]);

const SIBLING_TYPES = new Set(['brother', 'sister']);

function normalizeRelationType(type: string): 'spouse' | 'sibling' | null {
  const lower = type.trim().toLowerCase();
  if (SPOUSE_TYPES.has(lower)) return 'spouse';
  if (SIBLING_TYPES.has(lower)) return 'sibling';
  return null;
}

// ── Enrollment ID generator ──────────────────────────────────────────────────

const usedEnrollmentIds = new Set<string>();

function generateEnrollmentId(): string {
  for (let i = 0; i < 100; i++) {
    const id = String(crypto.randomInt(10000000, 99999999));
    if (!usedEnrollmentIds.has(id)) {
      usedEnrollmentIds.add(id);
      return id;
    }
  }
  throw new Error('Failed to generate unique enrollment ID');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const sqlPath = process.argv[2];
  if (!sqlPath) {
    console.error('Usage: npx tsx src/scripts/migrate-from-supabase.ts <backup.sql> [--dry-run]');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Parivaar Migration: Supabase → MongoDB`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log(`${'='.repeat(60)}\n`);

  // ── Parse SQL dump ───────────────────────────────────────────────────────
  console.log('Parsing SQL dump...');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  const lines = sql.split('\n');
  console.log(`  ${lines.length} lines read\n`);

  const communities = parseCopySection<SourceCommunity>(lines, 'communities', [
    'id', 'name', 'logo', 'image_path', 'description', 'type', 'sub_type',
    'status', 'code', 'created_at', 'updated_at', 'show_family_members',
  ]);

  const users = parseCopySection<SourceUser>(lines, 'users', [
    'id', 'first_name', 'last_name', 'profile_picture', 'image_path',
    'guardian_name', 'dob', 'bio', 'gender', 'education', 'native_place',
    'phone', 'landline', 'wedding_date', 'email', 'auth_id', 'blood_group',
    'is_account_manager', 'last_seen', 'is_super_admin', 'created_at',
    'updated_at', 'full_name', 'facebook_link', 'instagram_link',
    'linkedin_link', 'birth_time', 'blood_donor',
    'number_of_times_blood_donated', 'is_married', 'can_edit_family_members',
    'parent_node', 'root_node', 'push_tokens', 'approval_status',
  ]);

  const addresses = parseCopySection<SourceAddress>(lines, 'addresses', [
    'id', 'user_id', 'full_address', 'pincode', 'city', 'locality', 'state',
    'created_at', 'updated_at',
  ]);

  const relationships = parseCopySection<SourceRelationship>(lines, 'relationships', [
    'id', 'user_id', 'relative_id', 'type', 'created_at', 'updated_at',
  ]);

  const businesses = parseCopySection<SourceBusiness>(lines, 'businesses', [
    'id', 'owner_id', 'name', 'type', 'sub_type', 'description', 'address',
    'website', 'phone', 'created_at', 'updated_at',
  ]);

  const communityMembers = parseCopySection<SourceCommunityMember>(lines, 'community_members', [
    'id', 'community_id', 'user_id', 'created_at', 'updated_at',
  ]);

  const executives = parseCopySection<SourceExecutive>(lines, 'executives', [
    'id', 'community_id', 'user_id', 'roles', 'created_at', 'updated_at',
  ]);

  console.log('Parsed row counts:');
  console.log(`  communities:       ${communities.length}`);
  console.log(`  users:             ${users.length}`);
  console.log(`  addresses:         ${addresses.length}`);
  console.log(`  relationships:     ${relationships.length}`);
  console.log(`  businesses:        ${businesses.length}`);
  console.log(`  community_members: ${communityMembers.length}`);
  console.log(`  executives:        ${executives.length}\n`);

  // ── Build lookup maps ────────────────────────────────────────────────────

  // Users who are members of the target community
  const comm8UserIds = new Set(
    communityMembers
      .filter((cm) => cm.community_id === String(SOURCE_COMMUNITY_ID))
      .map((cm) => cm.user_id),
  );
  console.log(`Community ${SOURCE_COMMUNITY_ID} members: ${comm8UserIds.size}`);

  // Source user lookup
  const userByUuid = new Map<string, SourceUser>();
  for (const u of users) userByUuid.set(u.id, u);

  // Filter to community members only
  const targetUsers = users.filter((u) => comm8UserIds.has(u.id));
  console.log(`Target users to migrate: ${targetUsers.length}`);

  // Address lookup (user_id → address)
  const addressByUserId = new Map<string, SourceAddress>();
  for (const a of addresses) addressByUserId.set(a.user_id, a);

  // Source community
  const sourceCommunity = communities.find((c) => c.id === String(SOURCE_COMMUNITY_ID));
  if (!sourceCommunity) {
    console.error(`Community ${SOURCE_COMMUNITY_ID} not found in dump!`);
    process.exit(1);
  }
  console.log(`Source community: "${sourceCommunity.name}"\n`);

  // ── Phone deduplication ──────────────────────────────────────────────────
  const phoneOwner = new Map<string, string>(); // phone → first user UUID
  const phoneConflicts: Array<{ phone: string; uuid: string; existingUuid: string }> = [];
  const normalizedPhones = new Map<string, string | null>(); // uuid → normalized phone

  for (const u of targetUsers) {
    const phone = normalizePhone(u.phone);
    normalizedPhones.set(u.id, phone);
    if (phone) {
      const existing = phoneOwner.get(phone);
      if (existing) {
        phoneConflicts.push({ phone, uuid: u.id, existingUuid: existing });
        normalizedPhones.set(u.id, null); // skip duplicate
      } else {
        phoneOwner.set(phone, u.id);
      }
    }
  }

  if (phoneConflicts.length > 0) {
    console.log(`⚠ Phone conflicts (${phoneConflicts.length}):`);
    for (const c of phoneConflicts) {
      const u1 = userByUuid.get(c.existingUuid);
      const u2 = userByUuid.get(c.uuid);
      console.log(`  ${c.phone}: "${u1?.first_name} ${u1?.last_name}" vs "${u2?.first_name} ${u2?.last_name}" → keeping first`);
    }
    console.log();
  }

  // ── Collect localities ─────────────────────────────────────────────────
  const localitySet = new Set<string>();
  for (const u of targetUsers) {
    const addr = addressByUserId.get(u.id);
    if (addr?.locality) {
      localitySet.add(normalizeLocality(addr.locality));
    }
  }
  const sortedLocalities = [...localitySet].sort();
  console.log(`Unique localities: ${sortedLocalities.length}\n`);

  // ── Connect to MongoDB ───────────────────────────────────────────────────
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('DRY RUN — skipping MongoDB operations.\n');
    printSummary(targetUsers, sortedLocalities, relationships, businesses, comm8UserIds, executives);
    return;
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB\n');

  // Check for phone conflicts with existing DB users — merge instead of skip
  const existingPhoneUsers = await User.find(
    { phone: { $exists: true, $ne: null } },
    { phone: 1, _id: 1 },
  ).lean();
  // phone → existing MongoDB ObjectId (for users already in DB)
  const existingPhoneToObjectId = new Map<string, Types.ObjectId>();
  for (const u of existingPhoneUsers) {
    if (u.phone) existingPhoneToObjectId.set(u.phone, u._id as Types.ObjectId);
  }
  console.log(`  Existing users with phones in DB: ${existingPhoneToObjectId.size}`);

  try {
    await runMigration(
      sourceCommunity,
      targetUsers,
      addressByUserId,
      normalizedPhones,
      sortedLocalities,
      relationships,
      businesses,
      comm8UserIds,
      executives,
      userByUuid,
      existingPhoneToObjectId,
    );
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB disconnected.');
  }
}

async function runMigration(
  sourceCommunity: SourceCommunity,
  targetUsers: SourceUser[],
  addressByUserId: Map<string, SourceAddress>,
  normalizedPhones: Map<string, string | null>,
  sortedLocalities: string[],
  relationships: SourceRelationship[],
  businesses: SourceBusiness[],
  comm8UserIds: Set<string>,
  executives: SourceExecutive[],
  userByUuid: Map<string, SourceUser>,
  existingPhoneToObjectId: Map<string, Types.ObjectId>,
) {
  // ── Phase 1: Create Community ──────────────────────────────────────────
  console.log('Phase 1: Creating community...');
  const community = await Community.create({
    name: sourceCommunity.name,
    description: sourceCommunity.description,
    logo: sourceCommunity.logo,
    city: 'Udaipur',
    state: 'Rajasthan',
    status: 'Active',
    designations: [], // filled in Phase 6
    localities: { Udaipur: sortedLocalities },
  });
  const communityId = community._id;
  console.log(`  Created community: ${community.name} (${communityId})\n`);

  // ── Phase 2: Create Users ──────────────────────────────────────────────
  console.log('Phase 2: Creating users...');
  const uuidToObjectId = new Map<string, Types.ObjectId>();
  let usersCreated = 0;
  let usersMerged = 0;
  let usersWithoutGender = 0;

  // For users whose phone already exists in DB, reuse the existing ObjectId
  // and just add the new communityId. For new users, pre-generate ObjectIds.
  const mergeUuids = new Set<string>(); // UUIDs that map to existing DB users
  for (const u of targetUsers) {
    const phone = normalizedPhones.get(u.id);
    if (phone && existingPhoneToObjectId.has(phone)) {
      uuidToObjectId.set(u.id, existingPhoneToObjectId.get(phone)!);
      mergeUuids.add(u.id);
    } else {
      uuidToObjectId.set(u.id, new Types.ObjectId());
    }
  }

  // Merge existing users: add communityId
  for (const uuid of mergeUuids) {
    const oid = uuidToObjectId.get(uuid)!;
    const u = targetUsers.find((t) => t.id === uuid)!;
    await User.updateOne({ _id: oid }, { $addToSet: { communityIds: communityId } });
    console.log(`  Merged existing user: ${u.first_name} ${u.last_name} (${normalizedPhones.get(uuid)}) → added communityId`);
    usersMerged++;
  }

  // Create new users (exclude merged ones)
  const newUsers = targetUsers.filter((u) => !mergeUuids.has(u.id));

  for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
    const batch = newUsers.slice(i, i + BATCH_SIZE);
    const docs = batch.map((u) => {
      const addr = addressByUserId.get(u.id);
      const phone = normalizedPhones.get(u.id);
      if (!u.gender) usersWithoutGender++;

      return {
        _id: uuidToObjectId.get(u.id)!,
        enrollmentId: generateEnrollmentId(),
        firstName: u.first_name.trim(),
        lastName: u.last_name?.trim() || undefined,
        fullName: [u.first_name, u.last_name].filter(Boolean).map(s => s!.trim()).join(' ') || undefined,
        profilePicture: u.profile_picture || undefined,
        guardianName: u.guardian_name || undefined,
        dob: u.dob ? new Date(u.dob) : undefined,
        weddingDate: u.wedding_date ? new Date(u.wedding_date) : undefined,
        isMarried: u.is_married === 't' ? true : u.is_married === 'f' ? false : undefined,
        gender: u.gender || undefined,
        phone: phone || undefined,
        email: u.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email.trim()) ? u.email.trim() : undefined,
        education: u.education || undefined,
        bloodGroup: normalizeBloodGroup(u.blood_group),
        nativePlace: u.native_place || undefined,
        address: addr
          ? {
              fullAddress: addr.full_address || undefined,
              state: addr.state || undefined,
              city: addr.city || undefined,
              pincode: addr.pincode || undefined,
              locality: addr.locality ? normalizeLocality(addr.locality) : undefined,
            }
          : undefined,
        role: 'member' as const,
        communityIds: [communityId],
        isAlive: true,
        isFamilyHead: false, // set in Phase 3
        showPhoneInCommunity: true,
        showBusinessInCommunity: true,
        pushTokens: [],
        createdAt: new Date(u.created_at),
        updatedAt: new Date(u.updated_at),
      };
    });

    await User.insertMany(docs);
    usersCreated += docs.length;
    process.stdout.write(`  ${usersCreated}/${newUsers.length}\r`);
  }
  console.log(`  Created ${usersCreated} new users, merged ${usersMerged} existing (${usersWithoutGender} without gender)\n`);

  // ── Phase 3: Create Families ───────────────────────────────────────────
  console.log('Phase 3: Creating families...');

  // Group by root_node
  const familyGroups = new Map<string, string[]>(); // root_node UUID → member UUIDs
  const orphanUsers: string[] = []; // users without root_node

  for (const u of targetUsers) {
    if (u.root_node) {
      const members = familyGroups.get(u.root_node) || [];
      members.push(u.id);
      familyGroups.set(u.root_node, members);
    } else {
      orphanUsers.push(u.id);
    }
  }

  console.log(`  ${familyGroups.size} families from root_node`);
  console.log(`  ${orphanUsers.length} orphan users (no root_node) → creating singleton families`);

  // Create singleton families for orphans
  for (const uuid of orphanUsers) {
    familyGroups.set(uuid, [uuid]);
  }

  const familyDocs: Array<{
    _id: Types.ObjectId;
    headId: Types.ObjectId;
    sampradaya: string;
    communityIds: Types.ObjectId[];
  }> = [];

  const uuidToFamilyId = new Map<string, Types.ObjectId>();

  for (const [rootUuid, memberUuids] of familyGroups) {
    const headObjectId = uuidToObjectId.get(rootUuid);
    if (!headObjectId) {
      // Root node user is not in community 8 — find a member to be head
      const firstMemberUuid = memberUuids[0];
      const fallbackHead = uuidToObjectId.get(firstMemberUuid);
      if (!fallbackHead) continue;

      const familyId = new Types.ObjectId();
      familyDocs.push({
        _id: familyId,
        headId: fallbackHead,
        sampradaya: 'Terapanthi',
        communityIds: [communityId],
      });
      for (const uuid of memberUuids) {
        uuidToFamilyId.set(uuid, familyId);
      }
      continue;
    }

    const familyId = new Types.ObjectId();
    familyDocs.push({
      _id: familyId,
      headId: headObjectId,
      sampradaya: 'Terapanthi',
      communityIds: [communityId],
    });
    for (const uuid of memberUuids) {
      uuidToFamilyId.set(uuid, familyId);
    }
  }

  // Batch insert families
  let familiesCreated = 0;
  for (let i = 0; i < familyDocs.length; i += BATCH_SIZE) {
    const batch = familyDocs.slice(i, i + BATCH_SIZE);
    await Family.insertMany(batch);
    familiesCreated += batch.length;
  }
  console.log(`  Created ${familiesCreated} families\n`);

  // Update users with familyId and isFamilyHead
  console.log('  Updating users with familyId...');
  const bulkOps: mongoose.AnyBulkWriteOperation<any>[] = [];

  for (const u of targetUsers) {
    const familyId = uuidToFamilyId.get(u.id);
    if (!familyId) continue;

    const objectId = uuidToObjectId.get(u.id)!;
    const isHead =
      (!u.parent_node && u.root_node === u.id) || // explicit head
      (!u.root_node); // orphan → singleton head

    bulkOps.push({
      updateOne: {
        filter: { _id: objectId },
        update: { $set: { familyId, isFamilyHead: isHead } },
      },
    });
  }

  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    await User.bulkWrite(bulkOps.slice(i, i + BATCH_SIZE));
  }

  const headCount = bulkOps.filter(
    (op) => 'updateOne' in op && (op.updateOne.update as any).$set.isFamilyHead,
  ).length;
  console.log(`  Set familyId on ${bulkOps.length} users, ${headCount} marked as head\n`);

  // ── Phase 4: Relationships ─────────────────────────────────────────────
  console.log('Phase 4: Building relationships...');

  // 4a: Parent-child from parent_node
  const parentChildOps: mongoose.AnyBulkWriteOperation<any>[] = [];
  let parentChildCount = 0;
  let genderMissing = 0;

  for (const u of targetUsers) {
    if (!u.parent_node) continue;
    const parentObjectId = uuidToObjectId.get(u.parent_node);
    const childObjectId = uuidToObjectId.get(u.id);
    if (!parentObjectId || !childObjectId) continue;

    const parentUser = targetUsers.find((t) => t.id === u.parent_node);
    if (!parentUser) continue;

    // Set fatherId or motherId based on parent's gender
    const parentGender = parentUser.gender?.toLowerCase();
    if (parentGender === 'male') {
      parentChildOps.push({
        updateOne: {
          filter: { _id: childObjectId },
          update: { $set: { fatherId: parentObjectId } },
        },
      });
    } else if (parentGender === 'female') {
      parentChildOps.push({
        updateOne: {
          filter: { _id: childObjectId },
          update: { $set: { motherId: parentObjectId } },
        },
      });
    } else {
      genderMissing++;
      // Default to fatherId when gender unknown
      parentChildOps.push({
        updateOne: {
          filter: { _id: childObjectId },
          update: { $set: { fatherId: parentObjectId } },
        },
      });
    }

    // Add child to parent's childrenIds
    parentChildOps.push({
      updateOne: {
        filter: { _id: parentObjectId },
        update: { $addToSet: { childrenIds: childObjectId } },
      },
    });
    parentChildCount++;
  }

  for (let i = 0; i < parentChildOps.length; i += BATCH_SIZE) {
    await User.bulkWrite(parentChildOps.slice(i, i + BATCH_SIZE));
  }
  console.log(`  Parent-child links: ${parentChildCount} (${genderMissing} parent gender unknown → defaulted to fatherId)`);

  // 4b: Spouse relationships from relationships table
  const spouseOps: mongoose.AnyBulkWriteOperation<any>[] = [];
  const processedSpousePairs = new Set<string>();
  let spouseCount = 0;

  for (const rel of relationships) {
    const normalized = normalizeRelationType(rel.type);
    if (normalized !== 'spouse') continue;

    const userOid = uuidToObjectId.get(rel.user_id);
    const relativeOid = uuidToObjectId.get(rel.relative_id);
    if (!userOid || !relativeOid) continue;

    // Avoid duplicate pairs
    const pairKey = [rel.user_id, rel.relative_id].sort().join(':');
    if (processedSpousePairs.has(pairKey)) continue;
    processedSpousePairs.add(pairKey);

    spouseOps.push(
      {
        updateOne: {
          filter: { _id: userOid },
          update: { $set: { spouseId: relativeOid } },
        },
      },
      {
        updateOne: {
          filter: { _id: relativeOid },
          update: { $set: { spouseId: userOid } },
        },
      },
    );
    spouseCount++;
  }

  for (let i = 0; i < spouseOps.length; i += BATCH_SIZE) {
    await User.bulkWrite(spouseOps.slice(i, i + BATCH_SIZE));
  }
  console.log(`  Spouse links: ${spouseCount} pairs`);

  // 4c: Sibling relationships
  const siblingOps: mongoose.AnyBulkWriteOperation<any>[] = [];
  const processedSiblingPairs = new Set<string>();
  let siblingCount = 0;

  for (const rel of relationships) {
    const normalized = normalizeRelationType(rel.type);
    if (normalized !== 'sibling') continue;

    const userOid = uuidToObjectId.get(rel.user_id);
    const relativeOid = uuidToObjectId.get(rel.relative_id);
    if (!userOid || !relativeOid) continue;

    const pairKey = [rel.user_id, rel.relative_id].sort().join(':');
    if (processedSiblingPairs.has(pairKey)) continue;
    processedSiblingPairs.add(pairKey);

    siblingOps.push(
      {
        updateOne: {
          filter: { _id: userOid },
          update: { $addToSet: { siblingIds: relativeOid } },
        },
      },
      {
        updateOne: {
          filter: { _id: relativeOid },
          update: { $addToSet: { siblingIds: userOid } },
        },
      },
    );
    siblingCount++;
  }

  for (let i = 0; i < siblingOps.length; i += BATCH_SIZE) {
    await User.bulkWrite(siblingOps.slice(i, i + BATCH_SIZE));
  }
  console.log(`  Sibling links: ${siblingCount} pairs\n`);

  // ── Phase 5: Businesses ────────────────────────────────────────────────
  console.log('Phase 5: Creating businesses...');
  const targetBusinesses = businesses.filter((b) => comm8UserIds.has(b.owner_id));
  let businessesCreated = 0;

  for (let i = 0; i < targetBusinesses.length; i += BATCH_SIZE) {
    const batch = targetBusinesses.slice(i, i + BATCH_SIZE);
    const docs = batch
      .map((b) => {
        const ownerOid = uuidToObjectId.get(b.owner_id);
        if (!ownerOid) return null;
        return {
          ownerId: ownerOid,
          communityId,
          name: b.name || undefined,
          category: b.type || undefined,
          description: b.description || undefined,
          address: b.address || undefined,
          website: b.website || undefined,
          phone: b.phone || undefined,
        };
      })
      .filter(Boolean);

    await Business.insertMany(docs);
    businessesCreated += docs.length;
  }
  console.log(`  Created ${businessesCreated} businesses\n`);

  // ── Phase 6: Executives → Designations ─────────────────────────────────
  console.log('Phase 6: Setting up designations (executives)...');
  const comm8Executives = executives.filter(
    (e) => e.community_id === String(SOURCE_COMMUNITY_ID),
  );

  const designations = comm8Executives
    .map((exec) => {
      const userOid = uuidToObjectId.get(exec.user_id);
      const user = targetUsers.find((u) => u.id === exec.user_id);
      if (!userOid || !user) return null;

      // Parse roles from PostgreSQL array format: {role1,role2}
      const rolesStr = exec.roles.replace(/^\{|\}$/g, '');
      const roles = rolesStr.split(',').map((r) => r.replace(/"/g, '').trim());

      return roles.map((role) => ({
        id: new Types.ObjectId().toHexString(),
        memberId: userOid,
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        designation: role,
        year: new Date(exec.created_at).getFullYear().toString(),
      }));
    })
    .filter(Boolean)
    .flat();

  await Community.findByIdAndUpdate(communityId, {
    $set: { designations },
  });
  console.log(`  Added ${designations.length} designations\n`);

  // ── Phase 7: Verification ──────────────────────────────────────────────
  console.log('Phase 7: Verification...');
  const [userCount, familyCount, businessCount, communityDoc] = await Promise.all([
    User.countDocuments({ communityIds: communityId, role: 'member' }),
    Family.countDocuments({ communityIds: communityId }),
    Business.countDocuments({ communityId }),
    Community.findById(communityId),
  ]);

  console.log(`  Users:        ${userCount} (expected ~${targetUsers.length})`);
  console.log(`  Families:     ${familyCount} (expected ~${familyDocs.length})`);
  console.log(`  Businesses:   ${businessCount} (expected ~${targetBusinesses.length})`);
  console.log(`  Designations: ${communityDoc?.designations?.length ?? 0} (expected ${designations.length})`);
  console.log(`  Localities:   ${Object.values(communityDoc?.localities ?? {}).flat().length}`);

  // Spot check: families with >1 member
  const largeFamilies = await Family.aggregate([
    { $match: { communityIds: communityId } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'familyId',
        as: 'members',
      },
    },
    { $project: { memberCount: { $size: '$members' } } },
    { $sort: { memberCount: -1 } },
    { $limit: 5 },
  ]);
  console.log(`\n  Largest families (top 5):`);
  for (const f of largeFamilies) {
    console.log(`    Family ${f._id}: ${f.memberCount} members`);
  }

  // Check for users without familyId
  const noFamily = await User.countDocuments({
    communityIds: communityId,
    role: 'member',
    familyId: { $exists: false },
  });
  console.log(`\n  Users without familyId: ${noFamily}`);

  // Check relationship coverage
  const withSpouse = await User.countDocuments({
    communityIds: communityId,
    role: 'member',
    spouseId: { $exists: true },
  });
  const withFather = await User.countDocuments({
    communityIds: communityId,
    role: 'member',
    fatherId: { $exists: true },
  });
  const withMother = await User.countDocuments({
    communityIds: communityId,
    role: 'member',
    motherId: { $exists: true },
  });
  const withChildren = await User.countDocuments({
    communityIds: communityId,
    role: 'member',
    'childrenIds.0': { $exists: true },
  });
  console.log(`  With spouseId:    ${withSpouse}`);
  console.log(`  With fatherId:    ${withFather}`);
  console.log(`  With motherId:    ${withMother}`);
  console.log(`  With childrenIds: ${withChildren}`);

  console.log(`\n${'='.repeat(60)}`);
  console.log('  Migration complete!');
  console.log(`${'='.repeat(60)}\n`);
}

function printSummary(
  targetUsers: SourceUser[],
  localities: string[],
  relationships: SourceRelationship[],
  businesses: SourceBusiness[],
  comm8UserIds: Set<string>,
  executives: SourceExecutive[],
) {
  console.log('DRY RUN Summary:');
  console.log(`  Users to create:      ${targetUsers.length}`);
  console.log(`  Localities:           ${localities.length}`);
  console.log(`  Businesses to create: ${businesses.filter((b) => comm8UserIds.has(b.owner_id)).length}`);
  console.log(`  Executives:           ${executives.filter((e) => e.community_id === String(SOURCE_COMMUNITY_ID)).length}`);

  // Family group count
  const rootNodes = new Set<string>();
  let orphans = 0;
  for (const u of targetUsers) {
    if (u.root_node) rootNodes.add(u.root_node);
    else orphans++;
  }
  console.log(`  Families:             ${rootNodes.size} + ${orphans} singletons = ${rootNodes.size + orphans}`);

  // Relationship breakdown
  let spouseRels = 0;
  let siblingRels = 0;
  let parentChild = 0;
  let skipped = 0;

  for (const rel of relationships) {
    if (!comm8UserIds.has(rel.user_id) && !comm8UserIds.has(rel.relative_id)) continue;
    const n = normalizeRelationType(rel.type);
    if (n === 'spouse') spouseRels++;
    else if (n === 'sibling') siblingRels++;
    else skipped++;
  }

  for (const u of targetUsers) {
    if (u.parent_node && comm8UserIds.has(u.parent_node)) parentChild++;
  }

  console.log(`\n  Relationship breakdown:`);
  console.log(`    Parent-child (from parent_node): ${parentChild}`);
  console.log(`    Spouse (from relationships):     ${spouseRels}`);
  console.log(`    Sibling (from relationships):    ${siblingRels}`);
  console.log(`    Skipped (grandparent/in-law):    ${skipped}`);

  console.log(`\n  Localities (${localities.length}):`);
  for (const l of localities) {
    console.log(`    - ${l}`);
  }
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
