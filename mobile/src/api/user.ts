import type { UserListItem } from '@parivaar/shared';
import apiClient from './client';

export interface SearchUsersFilters {
  bloodGroup?: string;
  gender?: string;
  locality?: string;
  businessCategory?: string;
  ageMin?: number;
  ageMax?: number;
  nativePlace?: string;
  nativeDistrict?: string;
  sampradaya?: string;
  city?: string;
  district?: string;
  isFamilyHead?: boolean;
}

export interface SearchUsersParams {
  query?: string;
  communityId: string;
  filters?: SearchUsersFilters;
  page?: number;
  limit?: number;
}

interface SearchUsersResponse {
  success: boolean;
  users: UserListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function searchUsers(params: SearchUsersParams): Promise<SearchUsersResponse> {
  const { data } = await apiClient.get<SearchUsersResponse>('/users/search', {
    params: {
      communityId: params.communityId,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.query ? { query: params.query } : {}),
      ...(params.filters ? { filters: params.filters } : {}),
    },
  });
  return data;
}
