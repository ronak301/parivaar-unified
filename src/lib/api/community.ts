import { AxiosInstance } from "axios";
import defaultClient from "./client";
import type {
  Community,
  GetAllCommunitiesResponse,
  GetCommunityDetailsResponse,
  GetCommunityMembersResponse,
  SuccessResponse,
} from "./types";

export function getAllCommunities(api: AxiosInstance = defaultClient) {
  return api.get<GetAllCommunitiesResponse>("/community/all");
}

// Response shape not read by legacy code — treat defensively, don't rely on a
// specific field beyond a 2xx status.
export function createCommunity(
  input: Partial<Community>,
  api: AxiosInstance = defaultClient
) {
  return api.post<unknown>("/community/create", input);
}

export function updateCommunity(
  id: string,
  input: Partial<Community>,
  api: AxiosInstance = defaultClient
) {
  return api.put<unknown>(`/community/${id}`, input);
}

// Flat community object — no { data } wrapper.
export function getCommunityDetailsForId(
  id: string,
  api: AxiosInstance = defaultClient
) {
  return api.get<GetCommunityDetailsResponse>(`/community/${id}`);
}

export function getCommunityMembersForCommunityId(
  id: string,
  skip = 0,
  limit = 10,
  query = "",
  filter: Record<string, unknown> = {},
  api: AxiosInstance = defaultClient
) {
  return api.post<GetCommunityMembersResponse>(
    `/community/members/${id}`,
    { filter, query, skip, limit }
  );
}

export function addToCommunity(
  communityId: string,
  userId: string,
  api: AxiosInstance = defaultClient
) {
  return api.post<SuccessResponse>(`/community/join/${communityId}`, { userId });
}

export function removeFromCommunity(
  communityId: string,
  userId: string,
  api: AxiosInstance = defaultClient
) {
  return api.delete<SuccessResponse>(`/community/member/delete`, {
    data: { communityId, userId },
  });
}
