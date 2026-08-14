'use client';

import { useState } from 'react';
import type { Community } from '@parivaar/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

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

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
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
      </CardContent>
    </Card>
  );
}
