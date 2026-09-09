'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { readCache, writeCache } from '@/lib/cache/local-cache';
import { getAvatarColor } from '@/lib/member/avatar-color';
import { telLink, whatsappLink } from '@/lib/member/contact-links';
import { downloadMembersPdf, type ExportMember, type ExportColumnConfig, DEFAULT_EXPORT_COLUMNS } from '@/lib/export/members-pdf';
import { downloadMembersCsv } from '@/lib/export/members-csv';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClickableImage } from '@/components/ui/clickable-image';
import { AddFamilyDialog } from '@/components/admin/add-family-dialog';
import { Gender, BloodGroups, BusinessTypes, type Community } from '@parivaar/shared';
import {
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
  UserPlus,
  Users,
  Phone,
  MessageCircle,
  FileText,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input as TextInput } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface User {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture?: string;
  phone: string;
  gender?: string;
  address?: {
    city?: string;
    locality?: string;
  };
  familyId?: string;
  isFamilyHead?: boolean;
  isAlive?: boolean;
  guardianName?: string;
  education?: string;
  businessName?: string;
  businessCategory?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MembersResponse {
  success: boolean;
  users: User[];
  pagination: PaginationData;
}

interface MemberFilters {
  gender: string;
  bloodGroup: string;
  locality: string[];
  isMarried: string;
  businessCategory: string;
  ageMin: string;
  ageMax: string;
  hasSpecialEducation: boolean;
}

const EMPTY_FILTERS: MemberFilters = {
  gender: '',
  bloodGroup: '',
  locality: [],
  isMarried: '',
  businessCategory: '',
  ageMin: '',
  ageMax: '',
  hasSpecialEducation: false,
};

const PAGE_SIZE = 20;

/**
 * Columns for the wide layout. Driven by the *card's* width (container query),
 * not the viewport, so it also behaves next to the 260px sidebar.
 */
const ROW_GRID =
  '@4xl:grid @4xl:grid-cols-[minmax(200px,2fr)_minmax(100px,1fr)_minmax(120px,1.3fr)_minmax(120px,1.3fr)_6rem] @4xl:items-center @4xl:gap-3';

export function MembersDirectoryView({ communityId: propCommunityId }: { communityId?: string } = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<MemberFilters>(EMPTY_FILTERS);
  const [familyHeadOnly, setFamilyHeadOnly] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportColumns, setExportColumns] = useState<ExportColumnConfig>({ ...DEFAULT_EXPORT_COLUMNS });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  const communityId = propCommunityId || (user?.communities?.some(c => c._id === saved) ? saved : user?.communities?.[0]?._id) || '';
  const currentCommunity = user?.communities?.find((c) => c._id === communityId);

  const [localities, setLocalities] = useState<string[]>([]);

  const activeFilterCount = Object.values(filters).filter((v) => Array.isArray(v) ? v.length > 0 : typeof v === 'boolean' ? v : Boolean(v)).length;
  const hasActiveFilters = activeFilterCount > 0 || familyHeadOnly;

  useEffect(() => {
    if (!communityId) return;
    fetchMembers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, communityId, filters, familyHeadOnly]);

  useEffect(() => {
    if (!communityId) return;
    fetch(`/api/admin/communities/${communityId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    })
      .then((res) => res.json())
      .then((data: { community?: Community }) => {
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

  if (!user?.communities?.length) {
    return <div className="py-8 text-center text-m-ink-2">No communities available</div>;
  }

  function buildFilterParams(): URLSearchParams {
    const params = new URLSearchParams({ communityId });
    if (debouncedSearch) params.set('query', debouncedSearch);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.bloodGroup) params.set('bloodGroup', filters.bloodGroup);
    if (filters.locality.length) params.set('locality', filters.locality.join(','));
    if (filters.isMarried) params.set('isMarried', filters.isMarried);
    if (filters.businessCategory) params.set('businessCategory', filters.businessCategory);
    if (filters.ageMin) params.set('ageMin', filters.ageMin);
    if (filters.ageMax) params.set('ageMax', filters.ageMax);
    if (filters.hasSpecialEducation) params.set('hasSpecialEducation', 'true');
    if (familyHeadOnly) params.set('isFamilyHead', 'true');
    return params;
  }

  async function fetchMembers(pageNum: number) {
    if (!communityId) return;

    const cacheable = pageNum === 1 && !debouncedSearch && !hasActiveFilters;
    const cacheKey = `members_list_${communityId}`;

    if (cacheable) {
      const cached = readCache<MembersResponse>(cacheKey);
      if (cached) {
        setMembers(cached.users);
        setPagination(cached.pagination);
        setPage(pageNum);
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

    try {
      const params = buildFilterParams();
      params.set('page', String(pageNum));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/admin/members?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });

      if (res.ok) {
        const data: MembersResponse = await res.json();
        setMembers(data.users);
        setPagination(data.pagination);
        setPage(pageNum);
        if (cacheable) writeCache(cacheKey, data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  }

  /** Human-readable chips for whatever is currently narrowing the list. */
  function activeFilterChips(): Array<{ key: string; label: string; clear: () => void }> {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    const set = (patch: Partial<MemberFilters>) => setFilters((f) => ({ ...f, ...patch }));
    if (filters.gender) chips.push({ key: 'gender', label: Gender.find((g) => g.id === filters.gender)?.label ?? filters.gender, clear: () => set({ gender: '' }) });
    if (filters.bloodGroup) chips.push({ key: 'bloodGroup', label: `Blood ${BloodGroups.find((b) => b.id === filters.bloodGroup)?.label ?? filters.bloodGroup}`, clear: () => set({ bloodGroup: '' }) });
    for (const loc of filters.locality) {
      chips.push({ key: `locality:${loc}`, label: loc, clear: () => setFilters((f) => ({ ...f, locality: f.locality.filter((l) => l !== loc) })) });
    }
    if (filters.isMarried) chips.push({ key: 'isMarried', label: filters.isMarried === 'true' ? 'Married' : 'Unmarried', clear: () => set({ isMarried: '' }) });
    if (filters.businessCategory) chips.push({ key: 'businessCategory', label: BusinessTypes.find((b) => b.id === filters.businessCategory)?.label ?? filters.businessCategory, clear: () => set({ businessCategory: '' }) });
    if (filters.ageMin || filters.ageMax) chips.push({ key: 'age', label: `Age ${filters.ageMin || '0'}–${filters.ageMax || 'any'}`, clear: () => set({ ageMin: '', ageMax: '' }) });
    if (filters.hasSpecialEducation) chips.push({ key: 'specialEducation', label: 'Special Education', clear: () => set({ hasSpecialEducation: false }) });
    return chips;
  }

  function describeActiveFilters(): string {
    const parts = activeFilterChips().map((c) => c.label);
    if (familyHeadOnly) parts.unshift('Family heads only');
    if (debouncedSearch) parts.unshift(`Search: "${debouncedSearch}"`);
    return parts.length ? `Filters: ${parts.join(', ')}` : 'All members';
  }

  function clearAllFilters() {
    setFilters(EMPTY_FILTERS);
    setFamilyHeadOnly(false);
    setSearchQuery('');
  }

  function openExportDialog(format: 'pdf' | 'csv') {
    setExportFormat(format);
    setExportDialogOpen(true);
  }

  async function handleExport(format: 'pdf' | 'csv', columns: ExportColumnConfig) {
    if (!communityId || exporting) return;
    setExportDialogOpen(false);
    setExporting(format);
    setExportError(null);

    try {
      const res = await fetch(`/api/admin/members/export?${buildFilterParams()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);

      const data: { users: ExportMember[]; truncated?: boolean } = await res.json();
      if (!data.users?.length) {
        setExportError('No members match the current filters.');
        return;
      }

      const communityName = currentCommunity?.name ?? 'Community';
      if (format === 'csv') {
        downloadMembersCsv({ communityName, members: data.users, columns });
      } else {
        await downloadMembersPdf({ communityName, members: data.users, filterSummary: describeActiveFilters(), columns });
      }
      if (data.truncated) {
        setExportError('Export capped at 10,000 rows. Narrow the filters to include everyone.');
      }
    } catch (error) {
      console.error('Failed to export members:', error);
      setExportError(`Could not export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  }

  const getInitials = (u: User) => `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  const chips = activeFilterChips();
  const total = pagination?.total ?? 0;
  const rangeStart = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeEnd = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <>
      <div className="flex w-full flex-col pb-8">
        {/* Banner: the one bold element on the page */}
        <div className="m-banner @container relative -mx-6 -mt-6 overflow-hidden px-6 pb-16 pt-7 md:px-10 md:pt-9">
          <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-40 size-44 rounded-full bg-white/10" />

          <div className="relative flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-sm font-medium text-white/75">Members directory</p>
              <h1 className="mt-1 text-balance text-2xl font-bold leading-tight @3xl:text-3xl">
                {currentCommunity?.name ?? 'Community'}
              </h1>
              <p className="mt-1.5 text-sm text-white/80">
                {pagination
                  ? hasActiveFilters || debouncedSearch
                    ? `${total} of ${total === 1 ? 'the community' : 'all members'} match`
                    : `${total} ${total === 1 ? 'member' : 'members'}`
                  : 'Loading…'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {currentCommunity && (
                <>
                  <button
                    type="button"
                    onClick={() => window.open('/m', '_blank')}
                    className="inline-flex h-10 items-center gap-2 rounded-m-field border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <Users className="size-4" />
                    Member view
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(`/community/${currentCommunity._id}/form`, '_blank')}
                    className="inline-flex h-10 items-center gap-2 rounded-m-field border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <ExternalLink className="size-4" />
                    Open form
                  </button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!!exporting || loading || !total}
                  className="inline-flex h-10 items-center gap-2 rounded-m-field border border-white/25 bg-white/10 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
                >
                  <Download className="size-4" />
                  {exporting ? `Exporting ${exporting.toUpperCase()}…` : 'Export'}
                  <ChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => openExportDialog('pdf')}>
                    <FileText />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openExportDialog('csv')}>
                    <FileSpreadsheet />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-m-field bg-white px-4 text-sm font-semibold text-m-brand shadow-m-card transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <UserPlus className="size-4" />
                Add family
              </button>
            </div>
          </div>
        </div>

        {/* Floating search + filter card, overlapping the banner */}
        <div className="relative z-10 -mt-9 md:px-4">
          <div className="m-card-float flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-m-ink-3" />
                <input
                  type="text"
                  placeholder="Search by name or number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="m-field pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-m-ink-3 hover:bg-m-surface-2 hover:text-m-ink"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <label className="hidden cursor-pointer items-center gap-2 pl-2 text-sm font-medium text-m-ink sm:flex">
                Family heads only
                <button
                  type="button"
                  role="switch"
                  aria-checked={familyHeadOnly}
                  onClick={() => setFamilyHeadOnly((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m-brand/40 ${
                    familyHeadOnly ? 'bg-m-brand' : 'bg-m-ink-3/40'
                  }`}
                >
                  <span
                    className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                      familyHeadOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <Popover open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
                <PopoverTrigger className="m-field-btn relative hover:bg-m-surface-2" aria-label="Filters">
                  <SlidersHorizontal className="size-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-m-brand text-[10px] font-semibold text-m-on-brand">
                      {activeFilterCount}
                    </span>
                  )}
                </PopoverTrigger>

                <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-m-card border-m-line p-4 shadow-m-float">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-m-ink">Filter members</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilters(EMPTY_FILTERS);
                            setFamilyHeadOnly(false);
                          }}
                          className="text-xs font-medium text-m-brand hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:hidden">
                      <Label>Family heads only</Label>
                      <button
                        type="button"
                        onClick={() => setFamilyHeadOnly((v) => !v)}
                        data-active={familyHeadOnly}
                        className="m-chip w-fit"
                      >
                        {familyHeadOnly ? 'On' : 'Off'}
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-center justify-between">
                      <Label>Special Education</Label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={filters.hasSpecialEducation}
                        onClick={() => setFilters((f) => ({ ...f, hasSpecialEducation: !f.hasSpecialEducation }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m-brand/40 ${
                          filters.hasSpecialEducation ? 'bg-m-brand' : 'bg-m-ink-3/40'
                        }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                            filters.hasSpecialEducation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>

                    <div className="flex flex-col gap-2">
                      <Label>Blood group</Label>
                      <div className="flex flex-wrap gap-2">
                        {BloodGroups.map((bg) => {
                          const active = filters.bloodGroup === bg.id;
                          return (
                            <button
                              key={bg.id}
                              type="button"
                              data-active={active}
                              onClick={() => setFilters((f) => ({ ...f, bloodGroup: active ? '' : bg.id }))}
                              className="m-chip font-medium"
                            >
                              {bg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Gender</Label>
                      <div className="flex flex-wrap gap-2">
                        {Gender.map((g) => {
                          const active = filters.gender === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              data-active={active}
                              onClick={() => setFilters((f) => ({ ...f, gender: active ? '' : g.id }))}
                              className="m-chip font-medium"
                            >
                              {g.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Marital status</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'true', label: 'Married' },
                          { id: 'false', label: 'Unmarried' },
                        ].map((opt) => {
                          const active = filters.isMarried === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              data-active={active}
                              onClick={() => setFilters((f) => ({ ...f, isMarried: active ? '' : opt.id }))}
                              className="m-chip font-medium"
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Locality</Label>
                      {localities.length > 0 ? (
                        <div className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-md border border-input p-2">
                          {localities.map((loc) => {
                            const checked = filters.locality.includes(loc);
                            return (
                              <label key={loc} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-m-surface-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setFilters((f) => ({
                                      ...f,
                                      locality: checked
                                        ? f.locality.filter((l) => l !== loc)
                                        : [...f.locality, loc],
                                    }))
                                  }
                                  className="size-3.5 rounded border-gray-300 accent-[var(--m-brand)]"
                                />
                                {loc}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <TextInput
                          placeholder="Any locality"
                          value={filters.locality.join(', ')}
                          onChange={(e) => setFilters((f) => ({ ...f, locality: e.target.value ? [e.target.value] : [] }))}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Business category</Label>
                      <Select
                        value={filters.businessCategory}
                        onValueChange={(v) => setFilters((f) => ({ ...f, businessCategory: v ?? '' }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any category">
                            {(value: string) => BusinessTypes.find((bt) => bt.id === value)?.label ?? value}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {BusinessTypes.map((bt) => (
                            <SelectItem key={bt.id} value={bt.id}>
                              {bt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Age</Label>
                      <div className="flex items-center gap-2">
                        <TextInput
                          type="number"
                          min={0}
                          placeholder="From"
                          value={filters.ageMin}
                          onChange={(e) => setFilters((f) => ({ ...f, ageMin: e.target.value }))}
                        />
                        <span className="text-m-ink-3">to</span>
                        <TextInput
                          type="number"
                          min={0}
                          placeholder="Any"
                          value={filters.ageMax}
                          onChange={(e) => setFilters((f) => ({ ...f, ageMax: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {(chips.length > 0 || familyHeadOnly) && (
              <div className="flex flex-wrap items-center gap-2 px-0.5">
                {familyHeadOnly && (
                  <button type="button" data-active="true" className="m-chip" onClick={() => setFamilyHeadOnly(false)}>
                    Family heads only
                    <X className="size-3" />
                  </button>
                )}
                {chips.map((chip) => (
                  <button key={chip.key} type="button" data-active="true" className="m-chip" onClick={chip.clear}>
                    {chip.label}
                    <X className="size-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="ml-1 text-xs font-medium text-m-ink-2 hover:text-m-ink"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {exportError && (
          <p role="alert" className="mt-3 text-sm text-m-danger md:px-4">
            {exportError}
          </p>
        )}

        {/* Members list */}
        <div className="mt-5 md:px-4">
          <div className="m-card @container overflow-hidden">
            <div className={`hidden border-b border-m-line px-4 py-2.5 text-xs font-semibold text-m-ink-2 ${ROW_GRID}`}>
              <span>Member</span>
              <span>Phone</span>
              <span>Father&apos;s name</span>
              <span>Business or education</span>
              <span className="w-24" />
            </div>

            {loading ? (
              <MembersSkeleton />
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-m-brand/10 text-m-brand">
                  <Users className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-m-ink">
                    {hasActiveFilters || debouncedSearch ? 'No members match these filters' : 'No members yet'}
                  </p>
                  <p className="mt-1 text-sm text-m-ink-2">
                    {hasActiveFilters || debouncedSearch
                      ? 'Try a different name or remove a filter.'
                      : 'Add the first family to start the directory.'}
                  </p>
                </div>
                {hasActiveFilters || debouncedSearch ? (
                  <button type="button" onClick={clearAllFilters} className="m-chip" data-active="true">
                    Clear filters
                  </button>
                ) : (
                  <button type="button" onClick={() => setDialogOpen(true)} className="m-chip" data-active="true">
                    <UserPlus className="size-3.5" />
                    Add family
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-m-line">
                {members.map((member) => (
                  <MemberRow
                    key={member._id}
                    member={member}
                    initials={getInitials(member)}
                    onOpen={() => router.push(`/admin/community/${communityId}/members/${member._id}`)}
                  />
                ))}
              </ul>
            )}

            {pagination && pagination.total > 0 && !loading && (
              <div className="flex flex-col gap-3 border-t border-m-line bg-m-surface-2/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-m-ink-2">
                  Showing {rangeStart}–{rangeEnd} of {pagination.total}
                </span>
                {pagination.totalPages > 1 && (
                  <nav className="flex items-center gap-1" aria-label="Pagination">
                    <button
                      type="button"
                      onClick={() => fetchMembers(page - 1)}
                      disabled={page === 1}
                      aria-label="Previous page"
                      className="rounded-full p-1.5 text-m-ink-2 transition-colors hover:bg-m-surface-2 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-5" />
                    </button>

                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => fetchMembers(pageNum)}
                            aria-current={pageNum === page ? 'page' : undefined}
                            className={`size-8 rounded-full text-xs font-semibold transition-colors ${
                              pageNum === page
                                ? 'bg-m-brand text-m-on-brand'
                                : 'text-m-ink hover:bg-m-surface-2'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if ((i === 1 && page > 3) || (i === pagination.totalPages - 2 && page < pagination.totalPages - 2)) {
                        return (
                          <span key={`ellipsis-${i}`} className="px-1 text-m-ink-3">
                            …
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      type="button"
                      onClick={() => fetchMembers(page + 1)}
                      disabled={page === pagination.totalPages}
                      aria-label="Next page"
                      className="rounded-full p-1.5 text-m-ink-2 transition-colors hover:bg-m-surface-2 disabled:opacity-40"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {currentCommunity && (
        <AddFamilyDialog
          community={currentCommunity}
          onMemberAdded={() => fetchMembers(page)}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
            <DialogDescription>Choose which columns to include in the {exportFormat.toUpperCase()} export.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Columns</p>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked disabled className="size-3.5 rounded" />
                  Name
                </label>
                {([['phone', 'Phone'], ['address', 'Address'], ['locality', 'Locality']] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exportColumns[key]}
                      onChange={() => setExportColumns((c) => ({ ...c, [key]: !c[key] }))}
                      className="size-3.5 rounded border-gray-300 accent-[var(--m-brand)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Name format</p>
              <div className="flex flex-col gap-1.5">
                {([['firstLast', 'FirstName LastName'], ['lastFirst', 'LastName, FirstName (sorted by last name)']] as const).map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="nameFormat"
                      checked={exportColumns.nameFormat === value}
                      onChange={() => setExportColumns((c) => ({ ...c, nameFormat: value }))}
                      className="size-3.5 accent-[var(--m-brand)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setExportDialogOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleExport(exportFormat, exportColumns)}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Export {exportFormat.toUpperCase()}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MemberRow({ member, initials, onOpen }: { member: User; initials: string; onOpen: () => void }) {
  const avatar = getAvatarColor(member.fullName || `${member.firstName} ${member.lastName}`);
  const tel = telLink(member.phone);
  const wa = whatsappLink(member.phone);
  const place = member.address?.locality || member.address?.city;
  const work = member.businessName || member.education;
  const workSub = member.businessName ? member.businessCategory : undefined;

  return (
    <li
      className={`group relative cursor-pointer px-4 py-3 pr-28 transition-colors hover:bg-m-surface-2/70 @4xl:pr-4 ${ROW_GRID}`}
      onClick={onOpen}
    >
      {/* Member: avatar + name + enrollment / place */}
      <div className="flex min-w-0 items-center gap-3">
        {member.profilePicture ? (
          <ClickableImage
            src={member.profilePicture}
            alt={member.fullName}
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: avatar.bg, color: avatar.text }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="truncate text-left text-sm font-semibold text-m-ink focus-visible:outline-none focus-visible:underline"
            >
              {member.fullName}
            </button>
            {member.isFamilyHead && (
              <span className="shrink-0 rounded-full bg-m-tone-amber-bg px-2 py-0.5 text-[10px] font-semibold text-m-tone-amber-fg">
                Head
              </span>
            )}
            {member.isAlive === false && (
              <span className="shrink-0 rounded-full bg-m-surface-2 px-2 py-0.5 text-[10px] font-semibold text-m-ink-2">
                Late
              </span>
            )}
          </div>
          <p className="truncate text-xs text-m-ink-2">
            {[member.enrollmentId, place].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {/* Compact: one meta line under the name (hidden once the grid kicks in) */}
      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-14 text-xs text-m-ink-2 @4xl:hidden">
        {member.phone && <span className="text-m-ink">{member.phone}</span>}
        {member.guardianName && <span>Father: {member.guardianName}</span>}
        {work && (
          <span>
            {work}
            {workSub ? ` · ${workSub}` : ''}
          </span>
        )}
      </p>

      {/* Wide: phone */}
      <div className="hidden truncate text-sm tabular-nums text-m-ink @4xl:block">
        {member.phone || <span className="text-m-ink-3">—</span>}
      </div>

      {/* Wide: father's name */}
      <div className="hidden truncate text-sm text-m-ink @4xl:block">
        {member.guardianName || <span className="text-m-ink-3">—</span>}
      </div>

      {/* Wide: business / education */}
      <div className="hidden min-w-0 @4xl:block">
        {work ? (
          <>
            <p className="truncate text-sm text-m-ink">{work}</p>
            {workSub && <p className="truncate text-xs text-m-ink-2">{workSub}</p>}
          </>
        ) : (
          <span className="text-sm text-m-ink-3">—</span>
        )}
      </div>

      {/* Quick actions */}
      <div className="absolute right-4 top-3 flex items-center gap-1.5 @4xl:static">
        {tel && (
          <a
            href={tel}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Call ${member.fullName}`}
            className="flex size-9 items-center justify-center rounded-full bg-m-brand/10 text-m-brand transition-colors hover:bg-m-brand/20"
          >
            <Phone className="size-4" />
          </a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`WhatsApp ${member.fullName}`}
            className="flex size-9 items-center justify-center rounded-full bg-m-wa/12 text-m-wa-ink transition-colors hover:bg-m-wa/20"
          >
            <MessageCircle className="size-4" />
          </a>
        )}
        <ChevronRight className="hidden size-4 text-m-ink-3 transition-transform group-hover:translate-x-0.5 @4xl:block" />
      </div>
    </li>
  );
}

function MembersSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="divide-y divide-m-line" role="status" aria-label="Loading members">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className={`px-4 py-3 ${ROW_GRID}`}>
          <div className="flex items-center gap-3">
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-m-surface-2" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded-md bg-m-surface-2" />
              <div className="h-3 w-1/3 animate-pulse rounded-md bg-m-surface-2" />
            </div>
          </div>
          <div className="mt-2 h-3 w-3/5 animate-pulse rounded-md bg-m-surface-2 pl-14 @4xl:hidden" />
          <div className="hidden h-3.5 w-24 animate-pulse rounded-md bg-m-surface-2 @4xl:block" />
          <div className="hidden h-3.5 w-28 animate-pulse rounded-md bg-m-surface-2 @4xl:block" />
          <div className="hidden h-3.5 w-32 animate-pulse rounded-md bg-m-surface-2 @4xl:block" />
          <div className="hidden gap-1.5 @4xl:flex">
            <div className="size-9 animate-pulse rounded-full bg-m-surface-2" />
            <div className="size-9 animate-pulse rounded-full bg-m-surface-2" />
          </div>
        </li>
      ))}
    </ul>
  );
}
