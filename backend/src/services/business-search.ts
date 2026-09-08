/**
 * Ranked, typo-tolerant business search.
 *
 * Mongo `$text` only matches whole words on name + raw category id, so
 * "cloth", "car", "kapda", or "sofware" find nothing. This scorer runs over
 * the (small) per-community list instead:
 *   - normalises + tokenises the query
 *   - expands tokens via category synonyms (English + Hinglish)
 *   - scores weighted fields: name > category label/synonyms > description >
 *     owner name > address, with exact / prefix / fuzzy tiers
 *   - light stemming so "engineers" ≈ "engineer", "painting" ≈ "paint"
 */
import { BusinessTypes, BusinessCategorySynonyms } from '@parivaar/shared';

export interface SearchableBusiness {
  _id: unknown;
  name?: string;
  category?: string;
  description?: string;
  address?: string;
  ownerId?: unknown;
}

const WEIGHTS = {
  name: 10,
  category: 8,
  description: 4,
  owner: 3,
  address: 2,
} as const;

const TIER = { exact: 1, prefix: 0.7, fuzzy: 0.5, phrase: 0.35 } as const;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'in', 'for', 'and', 'or', 'to', 'at', 'on', 'near', 'me', 'my', 'is', 'are',
  'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'me', 'wala', 'wale', 'wali', 'ke liye', 'chahiye', 'kaun',
  'koi', 'hai', 'hain', 'best', 'good', 'top', 'shop', 'store', 'dukan', 'business', 'service', 'services',
]);

// Words that carry signal even though they are in STOPWORDS for phrase stripping.
const KEEP_IF_ALONE = new Set(['shop', 'store', 'dukan', 'service', 'services']);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Very light English stemmer: plurals and common suffixes. */
export function stem(word: string): string {
  if (word.length <= 3) return word;
  return word
    .replace(/ies$/, 'y')
    .replace(/(sses|shes|ches|xes)$/, (m) => m.slice(0, -2))
    .replace(/ings?$/, '')
    .replace(/ers?$/, '')
    .replace(/s$/, '');
}

export function tokenize(text: string): string[] {
  const words = normalize(text).split(' ').filter(Boolean);
  const kept = words.filter((w) => !STOPWORDS.has(w));
  // If the user typed only stopwords like "shop", keep the meaningful ones.
  const base = kept.length > 0 ? kept : words.filter((w) => KEEP_IF_ALONE.has(w));
  return [...new Set(base.map(stem))];
}

/** Damerau-Levenshtein (optimal string alignment) distance, early-exit at `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

function fuzzyBudget(len: number): number {
  if (len < 4) return 0;
  if (len < 7) return 1;
  return 2;
}

/** Best match tier of a query token against a bag of field tokens. */
function matchToken(token: string, fieldTokens: string[]): number {
  let best = 0;
  const budget = fuzzyBudget(token.length);
  for (const ft of fieldTokens) {
    if (ft === token) return TIER.exact;
    // Forward prefix: user is still typing ("soft" → "software"). Needs ≥3 chars
    // so "x" does not light up "xerox".
    if (token.length >= 3 && ft.startsWith(token)) best = Math.max(best, TIER.prefix);
    // Reverse prefix: stemmed field token is a head of the query ("engineer" vs
    // "engine"). Only for reasonably long field tokens, so "car" ≠ "ca".
    else if (ft.length >= 4 && token.startsWith(ft)) best = Math.max(best, TIER.prefix);
    else if (budget > 0 && editDistance(token, ft, budget) <= budget) best = Math.max(best, TIER.fuzzy);
  }
  return best;
}

/* ---------- Category vocabulary (built once) ---------- */

interface CategoryEntry {
  id: string;
  label: string;
  tokens: string[]; // stemmed tokens from label + synonyms
  phrases: string[]; // normalised multi-word synonyms for substring checks
}

const CATEGORY_INDEX: CategoryEntry[] = (() => {
  const out: CategoryEntry[] = [];
  const add = (id: string, label: string) => {
    const syn = BusinessCategorySynonyms[id] ?? [];
    const raw = [label, id.replace(/([a-z])([A-Z])/g, '$1 $2'), ...syn];
    const tokens = new Set<string>();
    const phrases: string[] = [];
    for (const r of raw) {
      const n = normalize(r);
      if (n.includes(' ')) phrases.push(n);
      for (const w of n.split(' ')) if (w && !STOPWORDS.has(w)) tokens.add(stem(w));
    }
    out.push({ id, label, tokens: [...tokens], phrases });
  };
  for (const bt of BusinessTypes) {
    add(bt.id, bt.label);
    for (const st of bt.subTypes ?? []) add(st.id, st.label);
  }
  return out;
})();

const CATEGORY_BY_ID = new Map(CATEGORY_INDEX.map((c) => [c.id, c]));

/** Categories the query is semantically about, with a 0..1 confidence. */
export function inferCategories(query: string): Array<{ id: string; label: string; score: number }> {
  const qTokens = tokenize(query);
  const qNorm = normalize(query);
  if (qTokens.length === 0) return [];
  const hits: Array<{ id: string; label: string; score: number }> = [];
  for (const c of CATEGORY_INDEX) {
    let s = 0;
    for (const t of qTokens) s += matchToken(t, c.tokens);
    for (const p of c.phrases) if (qNorm.includes(p)) s += TIER.exact;
    if (s > 0) hits.push({ id: c.id, label: c.label, score: s / qTokens.length });
  }
  return hits.sort((a, b) => b.score - a.score);
}

/* ---------- Scoring ---------- */

function ownerName(owner: unknown): string {
  if (!owner || typeof owner !== 'object') return '';
  const o = owner as { fullName?: string; firstName?: string; lastName?: string };
  return o.fullName ?? `${o.firstName ?? ''} ${o.lastName ?? ''}`;
}

export interface ScoredBusiness<T> {
  business: T;
  score: number;
  matchedOn: string[];
}

export function scoreBusiness<T extends SearchableBusiness>(
  business: T,
  qTokens: string[],
  qNorm: string,
  inferred: Map<string, number>,
): ScoredBusiness<T> {
  const fields: Array<{ key: keyof typeof WEIGHTS; text: string }> = [
    { key: 'name', text: business.name ?? '' },
    { key: 'description', text: business.description ?? '' },
    { key: 'owner', text: ownerName(business.ownerId) },
    { key: 'address', text: business.address ?? '' },
  ];

  let score = 0;
  const matchedOn = new Set<string>();

  for (const f of fields) {
    if (!f.text) continue;
    const norm = normalize(f.text);
    const toks = tokenize(f.text);
    let fieldScore = 0;
    for (const t of qTokens) fieldScore += matchToken(t, toks);
    // Whole-query substring bonus ("software eng" inside "Software Engineer").
    if (qNorm.length >= 3 && norm.includes(qNorm)) fieldScore += TIER.exact + TIER.phrase;
    if (fieldScore > 0) {
      score += fieldScore * WEIGHTS[f.key];
      matchedOn.add(f.key);
    }
  }

  // Category: match query tokens against this business's category vocabulary,
  // plus the inferred-category confidence (so "kapda" boosts ClothMerchant).
  if (business.category) {
    const entry = CATEGORY_BY_ID.get(business.category);
    let catScore = 0;
    if (entry) {
      for (const t of qTokens) catScore += matchToken(t, entry.tokens);
      for (const p of entry.phrases) if (qNorm.includes(p)) catScore += TIER.exact;
    } else {
      catScore += matchToken(qNorm, tokenize(business.category));
    }
    const inferredBoost = inferred.get(business.category) ?? 0;
    catScore = Math.max(catScore, inferredBoost * qTokens.length);
    if (catScore > 0) {
      score += catScore * WEIGHTS.category;
      matchedOn.add('category');
    }
  }

  return { business, score, matchedOn: [...matchedOn] };
}

/**
 * Rank `businesses` for `query`. Returns only items with a meaningful score,
 * best first; ties broken by name.
 */
export function searchBusinesses<T extends SearchableBusiness>(
  businesses: T[],
  query: string,
): { results: ScoredBusiness<T>[]; inferredCategories: Array<{ id: string; label: string; score: number }> } {
  const qTokens = tokenize(query);
  const qNorm = normalize(query);
  if (qTokens.length === 0 && qNorm.length < 2) return { results: [], inferredCategories: [] };

  // Category suggestions need an exact vocabulary hit: "car" must not suggest
  // Home Decor via "carpet", and "shop" ≈ "shoe" must not suggest Footwear.
  // Prefix/fuzzy still count toward ranking, just not toward the chips.
  const inferredList = inferCategories(query).filter((c) => c.score >= TIER.exact);
  const inferred = new Map(inferredList.map((c) => [c.id, c.score]));

  // Minimum score: one exact hit on the weakest field (address, 2) qualifies;
  // a lone prefix hit on address (1.4) does not.
  const minScore = 2;

  const results = businesses
    .map((b) => scoreBusiness(b, qTokens, qNorm, inferred))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score || (a.business.name ?? '').localeCompare(b.business.name ?? ''));

  return { results, inferredCategories: inferredList.slice(0, 3) };
}
