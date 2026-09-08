import Fuse from 'fuse.js';
import type { Business } from '@parivaar/shared';
import { BusinessTypes } from '@parivaar/shared';

/**
 * Hinglish / plain-language keywords → category ids.
 * Lets "sona" find Jewellery, "dawai" find Hospitals & Pharmacy, etc.
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Jwellery: ['gold', 'sona', 'silver', 'chandi', 'gehne', 'jewellery', 'jewelry', 'diamond', 'heera', 'ornament', 'sunar'],
  ClothMerchant: ['cloth', 'kapda', 'kapde', 'saree', 'sari', 'fabric', 'garment', 'textile', 'suit', 'dress', 'lehenga'],
  Hospitals: ['doctor', 'hospital', 'clinic', 'dawai', 'medicine', 'pharmacy', 'medical', 'chemist', 'ilaj', 'health'],
  'Hotels&Restaurants': ['hotel', 'restaurant', 'food', 'khana', 'cafe', 'dhaba', 'catering', 'sweets', 'mithai', 'bhojan'],
  Automobile: ['car', 'gaadi', 'gadi', 'bike', 'scooter', 'vehicle', 'auto', 'showroom', 'garage', 'mechanic', 'tyre', 'spare'],
  FinancialAdvisor: ['finance', 'loan', 'insurance', 'bima', 'investment', 'mutual fund', 'share', 'stock', 'tax', 'paisa', 'gst'],
  RealEstate: ['property', 'flat', 'plot', 'ghar', 'makan', 'house', 'builder', 'real estate', 'zameen', 'rent', 'construction'],
  GeneralStore: ['kirana', 'grocery', 'general store', 'provision', 'ration', 'daily needs', 'supermarket'],
  Marble: ['marble', 'granite', 'tiles', 'stone', 'patthar', 'flooring'],
  Paints: ['paint', 'rang', 'colour', 'color', 'putty', 'wall'],
  Footwear: ['shoes', 'juta', 'jute', 'chappal', 'footwear', 'sandal', 'slipper'],
  TourTravels: ['travel', 'tour', 'taxi', 'cab', 'ticket', 'yatra', 'trip', 'holiday', 'bus', 'flight', 'visa'],
  WeddingEventManagement: ['shaadi', 'shadi', 'wedding', 'event', 'decoration', 'tent', 'band', 'dj', 'mandap', 'function'],
  Beautician: ['beauty', 'parlour', 'parlor', 'salon', 'makeup', 'mehndi', 'bridal', 'hair', 'spa'],
  EducationInstitutions: ['school', 'college', 'coaching', 'tuition', 'padhai', 'education', 'institute', 'classes', 'academy'],
  Computers: ['computer', 'laptop', 'software', 'it', 'website', 'app', 'developer', 'tech', 'printer', 'cctv'],
  Utensils: ['bartan', 'utensil', 'steel', 'kitchenware', 'crockery'],
  HomeDecor: ['furniture', 'sofa', 'interior', 'decor', 'curtain', 'parda', 'mattress', 'gadda', 'furnishing'],
  ConstructionMaterials: ['cement', 'saria', 'sand', 'reti', 'bajri', 'brick', 'eent', 'building material'],
  IronSteel: ['iron', 'loha', 'steel', 'saria', 'tmt', 'metal'],
  Doctor: ['doctor', 'clinic', 'physician', 'surgeon', 'dentist', 'medical', 'hospital', 'dawai', 'ilaj'],
  Engineer: ['engineer', 'engineering', 'civil', 'mechanical', 'electrical', 'software'],
  CA: ['ca', 'chartered accountant', 'accountant', 'auditor', 'tax consultant', 'gst'],
  Architect: ['architect', 'architecture', 'design', 'interior designer', 'planner'],
  Lawyer: ['lawyer', 'advocate', 'vakil', 'legal', 'court', 'attorney', 'barrister', 'solicitor'],
  MBA: ['mba', 'management', 'business consultant'],
  Professionals: ['consultant', 'professional', 'freelance'],
  Transport: ['transport', 'truck', 'packers', 'movers', 'logistics', 'courier', 'tempo', 'shifting'],
  Stationary: ['stationery', 'stationary', 'gift', 'printing', 'press', 'xerox', 'photocopy', 'books', 'kitab', 'pen'],
  Sports: ['sports', 'cricket', 'gym', 'fitness', 'khel', 'badminton', 'football'],
  Turf: ['turf', 'box cricket', 'ground', 'maidan'],
  Hardware: ['hardware', 'nut', 'bolt', 'tools', 'plumbing', 'pipe', 'nal', 'sanitary'],
  Glass: ['glass', 'kanch', 'mirror', 'aluminium', 'window'],
  Electricals: ['electric', 'bijli', 'wire', 'light', 'fan', 'switch', 'electrician', 'inverter', 'battery'],
  HomeAppliances: ['tv', 'fridge', 'ac', 'washing machine', 'appliance', 'electronics', 'cooler', 'mobile', 'phone'],
  Machineries: ['machine', 'machinery', 'motor', 'pump', 'generator', 'equipment'],
  Laminates: ['ply', 'plywood', 'laminate', 'sunmica', 'board', 'veneer'],
  Agriculture: ['agriculture', 'kheti', 'farm', 'beej', 'seed', 'khaad', 'fertilizer', 'pesticide', 'tractor', 'krishi'],
  Advertising: ['advertising', 'ad', 'hoarding', 'banner', 'marketing', 'branding', 'flex', 'signage', 'prachar'],
  Manufacturing: ['factory', 'manufacturing', 'industry', 'karkhana', 'production', 'plant'],
  Service: ['service', 'repair', 'seva', 'maintenance'],
  SelfEmployed: ['freelance', 'self employed', 'consultant', 'independent'],
};

const CATEGORY_LABEL = new Map(BusinessTypes.map((bt) => [bt.id, bt.label]));

type PopulatedOwner = { firstName?: string; lastName?: string; fullName?: string };

export interface SearchableBusiness {
  business: Business;
  name: string;
  categoryLabel: string;
  keywords: string;
  description: string;
  address: string;
  ownerName: string;
}

function ownerNameOf(b: Business): string {
  const owner = b.ownerId as unknown as PopulatedOwner | string | undefined;
  if (!owner || typeof owner !== 'object') return '';
  return owner.fullName ?? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();
}

export function toSearchable(businesses: Business[]): SearchableBusiness[] {
  return businesses.map((b) => ({
    business: b,
    name: b.name ?? '',
    categoryLabel: b.category ? (CATEGORY_LABEL.get(b.category) ?? b.category) : '',
    keywords: b.category ? (CATEGORY_KEYWORDS[b.category] ?? []).join(' ') : '',
    description: b.description ?? '',
    address: b.address ?? '',
    ownerName: ownerNameOf(b),
  }));
}

export function createBusinessFuse(docs: SearchableBusiness[]) {
  return new Fuse(docs, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'categoryLabel', weight: 2 },
      { name: 'keywords', weight: 2 },
      { name: 'ownerName', weight: 1.5 },
      { name: 'description', weight: 1 },
      { name: 'address', weight: 0.5 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  });
}

export function searchBusinesses(
  fuse: Fuse<SearchableBusiness>,
  docs: SearchableBusiness[],
  query: string,
  categories: string[],
): Business[] {
  const q = query.trim();
  const catSet = new Set(categories);
  const byCategory = (d: SearchableBusiness) =>
    catSet.size === 0 || (d.business.category ? catSet.has(d.business.category) : false);

  if (!q) {
    return docs.filter(byCategory).map((d) => d.business);
  }

  return fuse
    .search(q)
    .map((r) => r.item)
    .filter(byCategory)
    .map((d) => d.business);
}
