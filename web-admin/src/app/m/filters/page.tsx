'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { useMemberAuth } from '@/context/member-auth-context';
import { useDirectoryFilters, EMPTY_DIRECTORY_FILTERS } from '@/lib/member/directory-filters';
import { FiltersPanel } from '@/components/member/filters-panel';
import { PageBanner } from '@/components/member/page-banner';
import { Button } from '@/components/ui/button';

export default function MemberFiltersPage() {
  const router = useRouter();
  const { user } = useMemberAuth();
  const { filters, setFilters, clearFilters } = useDirectoryFilters();
  const [draft, setDraft] = useState(filters);
  const [localities, setLocalities] = useState<string[]>([]);

  const communityId = user?.communityIds?.[0];

  useEffect(() => {
    if (!communityId) return;
    fetch(`/api/member/community/${communityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.community?.localities) {
          const map = data.community.localities;
          setLocalities(
            typeof map === 'object' && !Array.isArray(map)
              ? Object.values(map as Record<string, string[]>).flat().sort()
              : [],
          );
        }
      })
      .catch(() => {});
  }, [communityId]);

  const ageInvalid = !!draft.ageMin && !!draft.ageMax && Number(draft.ageMin) > Number(draft.ageMax);

  function handleApply() {
    if (ageInvalid) return;
    setFilters(draft);
    router.back();
  }

  function handleClear() {
    setDraft(EMPTY_DIRECTORY_FILTERS);
    clearFilters();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <PageBanner
        title="Filters"
        showBack
        compact
        action={
          <button onClick={handleClear} className="text-sm font-medium opacity-80">
            Clear all
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        <FiltersPanel filters={draft} onChange={setDraft} localities={localities} />
      </div>

      <div className="p-4">
        <Button type="button" className="h-12 w-full gap-2 rounded-xl text-sm" onClick={handleApply} disabled={ageInvalid}>
          <SlidersHorizontal className="size-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
