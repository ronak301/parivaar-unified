const CANDIDATE_CAP = 3000;
const FUZZY_MATCH_THRESHOLD = 0.45;

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }

  return dp[n];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function tokenScore(query: string, target: string): number {
  if (!query || !target) return 0;
  if (target.includes(query)) return 1;
  return similarity(query, target);
}

export interface FuzzyCandidate {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
}

export function fuzzyMatchScore(query: string, candidate: FuzzyCandidate): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const digitsOnlyQuery = q.replace(/\D/g, '');
  if (digitsOnlyQuery.length >= 3 && candidate.phone) {
    if (candidate.phone.includes(digitsOnlyQuery)) return 1;
    const phoneSim = similarity(digitsOnlyQuery, candidate.phone);
    if (phoneSim > 0.7) return phoneSim;
  }

  const fullName = (candidate.fullName || [candidate.firstName, candidate.lastName].filter(Boolean).join(' ')).toLowerCase();
  const nameCandidates = [fullName, candidate.firstName?.toLowerCase(), candidate.lastName?.toLowerCase()]
    .filter((v): v is string => !!v && v.trim().length > 0);

  let best = 0;
  for (const name of nameCandidates) {
    const score = tokenScore(q, name);
    if (score > best) best = score;
  }

  const queryTokens = q.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 1 && fullName) {
    const targetTokens = fullName.split(/\s+/).filter(Boolean);
    if (targetTokens.length > 0) {
      const perTokenScores = queryTokens.map((qt) => {
        let bestTok = 0;
        for (const tt of targetTokens) {
          const s = tt.includes(qt) ? 1 : similarity(qt, tt);
          if (s > bestTok) bestTok = s;
        }
        return bestTok;
      });
      const avg = perTokenScores.reduce((sum, s) => sum + s, 0) / perTokenScores.length;
      if (avg > best) best = avg;
    }
  }

  return best;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export function fuzzyFilterAndPaginate<T extends FuzzyCandidate>(
  candidates: T[],
  query: string,
  page: number,
  limit: number,
): Paginated<T> {
  const scored = candidates
    .map((candidate) => ({ candidate, score: fuzzyMatchScore(query, candidate) }))
    .filter((s) => s.score >= FUZZY_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score || (a.candidate.firstName || '').localeCompare(b.candidate.firstName || ''));

  const total = scored.length;
  const skip = (page - 1) * limit;
  const items = scored.slice(skip, skip + limit).map((s) => s.candidate);

  return { items, total };
}

export { CANDIDATE_CAP };
