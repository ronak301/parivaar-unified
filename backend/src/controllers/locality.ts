import type { Response } from 'express';
import { localitySuggestQuerySchema } from '@parivaar/shared';
import type { AuthRequest } from '../middleware';
import { Community } from '../models';
import { fetchLocalitySuggestions } from '../services/localitySuggestions';
import { normalizeLocalities } from '../utils/normalizeLocalities';

export async function suggestLocalities(req: AuthRequest, res: Response): Promise<void> {
  const parsed = localitySuggestQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { city, excludeCommunityId } = parsed.data;

  try {
    let suggestions = await fetchLocalitySuggestions(city);

    if (excludeCommunityId) {
      const community = await Community.findById(excludeCommunityId).select('localities');
      if (community?.localities) {
        const map = normalizeLocalities(community.localities);
        const existing = new Set(
          Object.values(map).flat().map((l) => l.toLowerCase()),
        );
        suggestions = suggestions.filter((s) => !existing.has(s.toLowerCase()));
      }
    }

    res.json({ success: true, suggestions });
  } catch (err) {
    console.error('Locality suggestion fetch failed:', err);
    res.status(502).json({ error: 'Unable to fetch locality suggestions right now. Please try again later.' });
  }
}
