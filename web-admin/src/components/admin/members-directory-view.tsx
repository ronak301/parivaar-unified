'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { readCache, writeCache } from '@/lib/cache/local-cache';
import { ClickableImage } from '@/components/ui/clickable-image';
import { AddFamilyDialog } from '@/components/admin/add-family-dialog';
import { Gender, BloodGroups, BusinessTypes, type Community } from '@parivaar/shared';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Store,
  BookOpen,
  ExternalLink,
  Users2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  locality: string;
  isMarried: string;
  businessCategory: string;
  ageMin: string;
  ageMax: string;
}

const EMPTY_FILTERS: MemberFilters = {
  gender: '',
  bloodGroup: '',
  locality: '',
  isMarried: '',
  businessCategory: '',
  ageMin: '',
  ageMax: '',
};

export function MembersDirectoryView({ communityId: propCommunityId }: { communityId?: string } = {}) {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [openImageId, setOpenImageId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<MemberFilters>(EMPTY_FILTERS);
  const [familyHeadOnly, setFamilyHeadOnly] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  const communityId = propCommunityId || (user?.communities?.some(c => c._id === saved) ? saved : user?.communities?.[0]?._id) || '';
  const currentCommunity = user?.communities?.find((c) => c._id === communityId);

  const [localities, setLocalities] = useState<string[]>(
    () => readCache<{ localities?: string[] }>(`community_detail_${communityId}`)?.localities ?? [],
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
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
        if (data.community?.localities) setLocalities(data.community.localities);
      })
      .catch(() => {});
  }, [communityId]);

  if (!user?.communities?.length) {
    return <div className="text-center py-8 text-[#464555]">No communities available</div>;
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
      const params = new URLSearchParams({
        communityId,
        page: String(pageNum),
        limit: '20',
      });

      if (debouncedSearch) {
        params.set('query', debouncedSearch);
      }
      if (filters.gender) params.set('gender', filters.gender);
      if (filters.bloodGroup) params.set('bloodGroup', filters.bloodGroup);
      if (filters.locality) params.set('locality', filters.locality);
      if (filters.isMarried) params.set('isMarried', filters.isMarried);
      if (filters.businessCategory) params.set('businessCategory', filters.businessCategory);
      if (filters.ageMin) params.set('ageMin', filters.ageMin);
      if (filters.ageMax) params.set('ageMax', filters.ageMax);
      if (familyHeadOnly) params.set('isFamilyHead', 'true');

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

  const getInitials = (user: User) => {
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <>
      <div className="flex flex-col w-full h-full gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3230c4] rounded-xl flex items-center justify-center text-white shrink-0">
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm8 0c1.66 0 2.99-1.34 2.99-3S25.66 5 24 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-[#0b1c30] truncate">{currentCommunity?.name ?? 'Community'}</h1>
              <p className="text-sm text-[#464555]">
                {pagination ? `${pagination.total} Members` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#464555] size-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white border border-[#c7c4d7] rounded-lg focus:ring-2 focus:ring-[#3230c4]/20 focus:outline-none text-sm text-[#0b1c30] placeholder:text-[#464555] transition-all"
              />
            </div>
            <Button
              variant={familyHeadOnly ? 'default' : 'outline'}
              onClick={() => setFamilyHeadOnly((v) => !v)}
              className={familyHeadOnly ? 'bg-[#0b1c30] hover:bg-[#1c2f47]' : ''}
            >
              <Users2 className="size-4" />
              Family Heads Only
            </Button>

            <Popover open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
              <PopoverTrigger render={<Button variant="outline" className="relative" />}>
                <Filter className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-[#0b1c30] text-white">{activeFilterCount}</Badge>
                )}
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0b1c30]">Filters</p>
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setFilters(EMPTY_FILTERS);
                          setFamilyHeadOnly(false);
                        }}
                        className="flex items-center gap-1 text-xs text-[#464555] hover:text-[#0b1c30]"
                      >
                        <X className="size-3.5" />
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Gender</Label>
                    <Select
                      value={filters.gender}
                      onValueChange={(v) => setFilters((f) => ({ ...f, gender: v ?? '' }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        {Gender.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Blood Group</Label>
                    <Select
                      value={filters.bloodGroup}
                      onValueChange={(v) => setFilters((f) => ({ ...f, bloodGroup: v ?? '' }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any">
                          {(value: string) => BloodGroups.find((bg) => bg.id === value)?.label ?? value}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {BloodGroups.map((bg) => (
                          <SelectItem key={bg.id} value={bg.id}>
                            {bg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Locality</Label>
                    {localities.length > 0 ? (
                      <Select
                        value={filters.locality}
                        onValueChange={(v) => setFilters((f) => ({ ...f, locality: v ?? '' }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {localities.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <TextInput
                        placeholder="Any"
                        value={filters.locality}
                        onChange={(e) => setFilters((f) => ({ ...f, locality: e.target.value }))}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Married</Label>
                    <Select
                      value={filters.isMarried}
                      onValueChange={(v) => setFilters((f) => ({ ...f, isMarried: v ?? '' }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any">
                          {(value: string) => (value === 'true' ? 'Married' : 'Unmarried')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Married</SelectItem>
                        <SelectItem value="false">Unmarried</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Business Category</Label>
                    <Select
                      value={filters.businessCategory}
                      onValueChange={(v) => setFilters((f) => ({ ...f, businessCategory: v ?? '' }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any">
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
                        placeholder="Min"
                        value={filters.ageMin}
                        onChange={(e) => setFilters((f) => ({ ...f, ageMin: e.target.value }))}
                      />
                      <span className="text-[#464555]">–</span>
                      <TextInput
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={filters.ageMax}
                        onChange={(e) => setFilters((f) => ({ ...f, ageMax: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline">
              <Download className="size-4" />
              Export CSV
            </Button>
            {currentCommunity && (
              <Button
                variant="outline"
                onClick={() => window.open(`/community/${currentCommunity._id}/form`, '_blank')}
              >
                <ExternalLink className="size-4" />
                Open Form
              </Button>
            )}
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#0b1c30] hover:bg-[#1c2f47]"
            >
              <UserPlus className="size-4" />
              Add Family
            </Button>
          </div>
        </div>


      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c7c4d7]/30 flex flex-col flex-1 overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#464555]">Loading members...</div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[#0b1c30] sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-xs text-white/90 font-semibold uppercase tracking-wide w-[90px]">Profile</th>
                    <th className="py-4 px-6 text-xs text-white/90 font-semibold uppercase tracking-wide min-w-[220px]">Name</th>
                    <th className="py-4 px-6 text-xs text-white/90 font-semibold uppercase tracking-wide min-w-[200px]">Father&apos;s Name</th>
                    <th className="py-4 px-6 text-xs text-white/90 font-semibold uppercase tracking-wide min-w-[250px]">Business / Education</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c7c4d7]/20">
                  {members.map((member, i) => (
                    <tr
                      key={member._id}
                      className={`hover:bg-[#e5eeff]/50 transition-colors cursor-pointer ${
                        i % 2 === 1 ? 'bg-[#e5eeff]/25' : 'bg-white'
                      }`}
                      onClick={() => window.location.href = `/admin/community/${communityId}/members/${member._id}`}
                    >
                      <td className="py-4 px-6">
                        {member.profilePicture ? (
                          <ClickableImage
                            src={member.profilePicture}
                            alt={member.fullName}
                            className="w-11 h-11 rounded-full object-cover shadow-sm cursor-pointer"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#3230c4] text-sm font-semibold">
                            {getInitials(member)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-[#0b1c30]">{member.fullName}</span>
                          <span className="text-sm text-[#464555]">{member.enrollmentId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-[#0b1c30]">{member.guardianName || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        {member.businessName ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#0b1c30]">{member.businessName}</span>
                            {member.businessCategory && (
                              <span className="text-sm text-[#464555]">{member.businessCategory}</span>
                            )}
                          </div>
                        ) : member.education ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#0b1c30]">{member.education}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#464555]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="border-t border-[#c7c4d7]/30 px-4 py-3 bg-white flex items-center justify-between">
                <span className="text-xs text-[#464555]">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} members
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchMembers(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-[#e5eeff] text-[#464555] transition-colors disabled:opacity-50"
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
                          onClick={() => fetchMembers(pageNum)}
                          className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                            pageNum === page
                              ? 'bg-[#0b1c30] text-white'
                              : 'hover:bg-[#e5eeff] text-[#0b1c30]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }

                    if ((i === 1 && page > 3) || (i === pagination.totalPages - 2 && page < pagination.totalPages - 2)) {
                      return (
                        <span key={`ellipsis-${i}`} className="text-[#464555] px-1">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  <button
                    onClick={() => fetchMembers(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="p-1.5 rounded hover:bg-[#e5eeff] text-[#464555] transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
    </>
  );
}
