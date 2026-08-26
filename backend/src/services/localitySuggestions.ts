import axios from 'axios';

const POSTAL_API_BASE = 'https://api.postalpincode.in';
const MAX_SUGGESTIONS = 100;
const TRAILING_PARENS = /\s*\([^)]*\)\s*$/;

interface PostOffice {
  Name: string;
}

interface PostalApiResponse {
  Status: string;
  PostOffice: PostOffice[] | null;
}

export async function fetchLocalitySuggestions(city: string): Promise<string[]> {
  const response = await axios.get<PostalApiResponse[]>(
    `${POSTAL_API_BASE}/postoffice/${encodeURIComponent(city)}`,
    { timeout: 5000 },
  );

  const result = response.data?.[0];
  if (!result || result.Status !== 'Success') {
    return [];
  }

  const seen = new Map<string, string>();
  for (const office of result.PostOffice ?? []) {
    const cleaned = office.Name?.replace(TRAILING_PARENS, '').trim();
    if (!cleaned || cleaned.length > 200) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, cleaned);
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => a.localeCompare(b))
    .slice(0, MAX_SUGGESTIONS);
}
