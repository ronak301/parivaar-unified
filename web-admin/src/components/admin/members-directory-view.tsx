'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { readCache, writeCache } from '@/lib/cache/local-cache';
import { ClickableImage } from '@/components/ui/clickable-image';
import { AddFamilyDialog } from '@/components/admin/add-family-dialog';
import type { Community } from '@parivaar/shared';
import {
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  Store,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

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

export function MembersDirectoryView({ communityId: propCommunityId }: { communityId?: string } = {}) {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [openImageId, setOpenImageId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const saved = typeof window !== 'undefined' ? localStorage.getItem('selectedCommunityId') : null;
  const communityId = propCommunityId || (user?.communities?.some(c => c._id === saved) ? saved : user?.communities?.[0]?._id) || '';
  const currentCommunity = user?.communities?.find((c: Community) => c._id === communityId);

  useEffect(() => {
    if (!communityId) return;
    fetchMembers(1);
  }, [debouncedSearch, communityId]);

  if (!user?.communities?.length) {
    return <div className="text-center py-8 text-[#464555]">No communities available</div>;
  }

  async function fetchMembers(pageNum: number) {
    if (!communityId) return;

    const cacheable = pageNum === 1 && !debouncedSearch;
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#3230c4] rounded-xl flex items-center justify-center text-white">
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm8 0c1.66 0 2.99-1.34 2.99-3S25.66 5 24 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0b1c30]">{currentCommunity?.name ?? 'Community'}</h1>
              <p className="text-sm text-[#464555]">
                {pagination ? `${pagination.total} Members` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#464555] size-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#e5eeff] rounded-lg border-none focus:ring-2 focus:ring-[#3230c4]/20 focus:outline-none text-sm text-[#0b1c30] placeholder:text-[#464555] transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-sm transition-colors whitespace-nowrap">
              <Download className="size-5" />
              Export CSV
            </button>
            {currentCommunity && (
              <button
                onClick={() => window.open(`/community/${currentCommunity._id}/form`, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                <ExternalLink className="size-5" />
                Open Form
              </button>
            )}
            <Button
              size="lg"
              onClick={() => setDialogOpen(true)}
              className="bg-[#3230c4] hover:bg-[#494ad9]"
            >
              <UserPlus className="size-5" />
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
                <thead className="bg-[#e5eeff]/50 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="py-3 px-4 text-xs text-[#464555] font-semibold w-[80px]">Photo</th>
                    <th className="py-3 px-4 text-xs text-[#464555] font-semibold min-w-[200px]">Member Details</th>
                    <th className="py-3 px-4 text-xs text-[#464555] font-semibold min-w-[200px]">Guardian</th>
                    <th className="py-3 px-4 text-xs text-[#464555] font-semibold min-w-[250px]">Business / Education</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c7c4d7]/20">
                  {members.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-[#e5eeff]/30 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/admin/community/${communityId}/members/${member._id}`}
                    >
                      <td className="py-3 px-4">
                        {member.profilePicture ? (
                          <ClickableImage
                            src={member.profilePicture}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#3230c4] text-xs font-semibold">
                            {getInitials(member)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#0b1c30]">{member.fullName}</span>
                          <span className="text-xs text-[#464555]">{member.enrollmentId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-[#0b1c30]">{member.guardianName || '—'}</span>
                          <span className="text-xs text-[#464555]">
                            {member.isFamilyHead ? 'Self (Head)' : 'Family member'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {member.businessName ? (
                            <>
                              <Store className="size-4 text-[#3230c4]" />
                              <span className="text-sm text-[#0b1c30] truncate">{member.businessName}</span>
                            </>
                          ) : member.education ? (
                            <>
                              <BookOpen className="size-4 text-[#4648d4]" />
                              <span className="text-sm text-[#0b1c30] truncate">{member.education}</span>
                            </>
                          ) : (
                            <span className="text-sm text-[#464555]">—</span>
                          )}
                        </div>
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
                              ? 'bg-[#3230c4] text-white'
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
