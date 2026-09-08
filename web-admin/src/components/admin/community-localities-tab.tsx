'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Sparkles, Loader2, Check, MapPin, ChevronDown } from 'lucide-react';

export function CommunityLocalitiesTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const localityMap: Record<string, string[]> =
    community.localities && typeof community.localities === 'object' && !Array.isArray(community.localities)
      ? community.localities
      : {};

  const cities = Object.keys(localityMap);
  const [activeCity, setActiveCity] = useState(cities[0] ?? '');
  const [newLocality, setNewLocality] = useState('');
  const [newCity, setNewCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [suggestAttempted, setSuggestAttempted] = useState(false);

  const areas = localityMap[activeCity] ?? [];

  async function persist(next: Record<string, string[]>) {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/communities/${community._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localities: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save');
        return;
      }
      onUpdated(data.community);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  function handleAddCity() {
    const city = newCity.trim();
    if (!city || localityMap[city]) return;
    setActiveCity(city);
    setNewCity('');
    persist({ ...localityMap, [city]: [] });
  }

  function handleRemoveCity(city: string) {
    const next = { ...localityMap };
    delete next[city];
    if (activeCity === city) setActiveCity(Object.keys(next)[0] ?? '');
    persist(next);
  }

  function handleAddLocality() {
    const val = newLocality.trim();
    if (!val || !activeCity || areas.includes(val)) return;
    persist({ ...localityMap, [activeCity]: [...areas, val] });
    setNewLocality('');
  }

  function handleRemoveLocality(val: string) {
    persist({ ...localityMap, [activeCity]: areas.filter((l) => l !== val) });
  }

  async function handleSuggest() {
    if (!activeCity) return;
    setSuggestLoading(true);
    setSuggestError('');
    setSuggestAttempted(true);
    try {
      const params = new URLSearchParams({ city: activeCity, communityId: community._id });
      const res = await fetch(`/api/admin/localities/suggest?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setSuggestError(data.error ?? 'Failed');
        setSuggestions([]);
        return;
      }
      setSuggestions(data.suggestions ?? []);
      setSelected(new Set());
    } catch {
      setSuggestError('Network error');
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  function toggleSelected(val: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  async function handleAddSelected() {
    if (!selected.size || !activeCity) return;
    const toAdd = Array.from(selected).filter((s) => !areas.includes(s));
    await persist({ ...localityMap, [activeCity]: [...areas, ...toAdd] });
    setSuggestions((prev) => prev.filter((s) => !selected.has(s)));
    setSelected(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      {/* City selector + add */}
      <div className="m-card flex flex-col gap-3 p-4">
        <p className="text-sm font-semibold text-m-ink">Cities</p>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setActiveCity(city);
                setSuggestions([]);
                setSuggestAttempted(false);
              }}
              data-active={activeCity === city}
              className="m-chip pr-1.5"
            >
              {city}
              <span
                className="rounded-full px-1.5 text-[11px] font-normal"
                style={{ opacity: 0.6 }}
              >
                {localityMap[city]?.length ?? 0}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCity(city);
                }}
                disabled={saving}
                className="rounded-full p-0.5 text-m-ink-3 transition-colors hover:bg-m-surface-2 hover:text-m-danger"
                aria-label={`Remove ${city}`}
              >
                <X className="size-3" />
              </button>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a city…"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
            className="max-w-xs"
          />
          <Button onClick={handleAddCity} disabled={saving || !newCity.trim()} size="sm">
            <Plus /> Add city
          </Button>
        </div>
      </div>

      {/* Localities for active city */}
      {activeCity && (
        <div className="m-card flex flex-col gap-4 p-4">
          <div>
            <p className="text-sm font-semibold text-m-ink">
              Localities in {activeCity}
            </p>
            <p className="text-xs text-m-ink-2">
              Areas members can pick when filling their address.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add a locality…"
              value={newLocality}
              onChange={(e) => setNewLocality(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocality())}
              className="max-w-xs"
            />
            <Button onClick={handleAddLocality} disabled={saving || !newLocality.trim()} size="sm">
              <Plus /> Add
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {areas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-m-surface-2/60 px-6 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
                <MapPin className="size-5" />
              </div>
              <p className="text-sm font-semibold text-m-ink">No localities yet</p>
              <p className="text-sm text-m-ink-2">Type one above, or pull suggestions.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map((loc) => (
                <span key={loc} className="m-chip pr-1.5">
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocality(loc)}
                    disabled={saving}
                    className="rounded-full p-0.5 text-m-ink-3 transition-colors hover:bg-m-surface-2 hover:text-m-danger"
                    aria-label={`Remove ${loc}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggest from internet */}
          <div className="flex flex-col gap-3 border-t border-m-line pt-4">
            <Button
              onClick={handleSuggest}
              disabled={suggestLoading}
              variant="outline"
              size="sm"
              className="w-fit"
            >
              {suggestLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Suggest from internet
            </Button>

            {suggestError && <p className="text-sm text-destructive">{suggestError}</p>}
            {!suggestLoading && suggestAttempted && !suggestError && suggestions.length === 0 && (
              <p className="text-sm text-muted-foreground">No suggestions found.</p>
            )}

            {suggestions.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => {
                    const isSelected = selected.has(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSelected(s)}
                        data-active={isSelected}
                        className="m-chip font-medium"
                      >
                        {isSelected && <Check className="size-3" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <Button onClick={handleAddSelected} disabled={saving || !selected.size} size="sm" className="w-fit">
                  Add selected ({selected.size})
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
