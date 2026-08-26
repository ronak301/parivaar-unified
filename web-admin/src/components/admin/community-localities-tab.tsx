'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@chakra-ui/react';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles, Loader2, Check } from 'lucide-react';

export function CommunityLocalitiesTab({
  community,
  onUpdated,
}: {
  community: Community;
  onUpdated: (community: Community) => void;
}) {
  const localities = community.localities ?? [];
  const [newLocality, setNewLocality] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [manualCity, setManualCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [suggestAttempted, setSuggestAttempted] = useState(false);

  async function persist(next: string[]) {
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
        setError(data.error ?? 'Failed to save changes');
        return;
      }
      onUpdated(data.community);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    const value = newLocality.trim();
    if (!value || localities.includes(value)) return;
    await persist([...localities, value]);
    setNewLocality('');
  }

  async function handleRemove(value: string) {
    await persist(localities.filter((l) => l !== value));
  }

  async function handleSuggest() {
    const city = (community.city || manualCity).trim();
    if (!city) return;

    setSuggestLoading(true);
    setSuggestError('');
    setSuggestAttempted(true);
    try {
      const params = new URLSearchParams({ city, communityId: community._id });
      const res = await fetch(`/api/admin/localities/suggest?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setSuggestError(data.error ?? 'Failed to fetch suggestions');
        setSuggestions([]);
        return;
      }
      setSuggestions(data.suggestions ?? []);
      setSelected(new Set());
    } catch {
      setSuggestError('Network error. Please try again.');
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }

  function toggleSelected(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  async function handleAddSelected() {
    if (selected.size === 0) return;
    const toAdd = Array.from(selected).filter((s) => !localities.includes(s));
    await persist([...localities, ...toAdd]);
    setSuggestions((prev) => prev.filter((s) => !selected.has(s)));
    setSelected(new Set());
  }

  return (
    <div className="chakra-scope">
    <Card.Root>
      <Card.Body className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a locality..."
            value={newLocality}
            onChange={(e) => setNewLocality(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="max-w-xs"
          />
          <Button onClick={handleAdd} disabled={saving || !newLocality.trim()} size="sm">
            <Plus />
            Add
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {localities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No localities added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {localities.map((locality) => (
              <Badge key={locality} variant="outline" className="gap-1 pr-1">
                {locality}
                <button
                  type="button"
                  onClick={() => handleRemove(locality)}
                  disabled={saving}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${locality}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {!community.city && (
              <Input
                placeholder="Enter a city..."
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                className="max-w-xs"
              />
            )}
            <Button
              onClick={handleSuggest}
              disabled={suggestLoading || !(community.city || manualCity).trim()}
              variant="outline"
              size="sm"
            >
              {suggestLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Suggest from internet
            </Button>
          </div>

          {suggestError && <p className="text-sm text-destructive">{suggestError}</p>}

          {!suggestLoading && suggestAttempted && !suggestError && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">No suggestions found for this city.</p>
          )}

          {suggestions.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => {
                  const isSelected = selected.has(suggestion);
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => toggleSelected(suggestion)}
                      className="inline-flex"
                    >
                      <Badge variant={isSelected ? 'default' : 'outline'} className="gap-1">
                        {isSelected && <Check className="size-3" />}
                        {suggestion}
                      </Badge>
                    </button>
                  );
                })}
              </div>
              <Button onClick={handleAddSelected} disabled={saving || selected.size === 0} size="sm" className="w-fit">
                Add selected ({selected.size})
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card.Root>
    </div>
  );
}
