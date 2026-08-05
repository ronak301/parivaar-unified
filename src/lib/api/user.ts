import { AxiosInstance } from "axios";
import defaultClient from "./client";
import type {
  CreateUserResponse,
  GetMemberDetailsResponse,
  Member,
  SearchUserResponse,
} from "./types";

export function getMemberDetails(
  userId: string,
  api: AxiosInstance = defaultClient
) {
  return api.get<GetMemberDetailsResponse>(`/user/${userId}`);
}

export function searchUser(phone: string, api: AxiosInstance = defaultClient) {
  return api.post<SearchUserResponse>("/user/search", {
    query: phone,
    filter: {},
    limit: 1,
    offset: 0,
  });
}

// Flat created-user object (has .id at top level) — no { data } wrapper.
export function createUser(
  input: Partial<Member>,
  api: AxiosInstance = defaultClient
) {
  return api.post<CreateUserResponse>("/user/new", input);
}

// Response shape not read by legacy code — treat defensively.
export function updateUser(
  id: string,
  input: Partial<Member>,
  api: AxiosInstance = defaultClient
) {
  return api.put<unknown>(`/user/${id}`, input);
}

export function deleteUser(id: string, api: AxiosInstance = defaultClient) {
  return api.delete(`/user/delete/${id}`);
}
