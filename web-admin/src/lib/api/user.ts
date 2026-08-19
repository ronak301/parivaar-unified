import type { AxiosInstance } from 'axios';
import type { User, UserListItem } from '@parivaar/shared';

export async function checkPhone(
  client: AxiosInstance,
  phone: string,
): Promise<{ exists: boolean; user?: { _id: string; firstName: string; lastName?: string; fullName?: string; communityIds?: { _id: string; name: string }[] } }> {
  const res = await client.get('/users/check-phone', { params: { phone } });
  return res.data;
}

export async function createUser(
  client: AxiosInstance,
  data: Record<string, unknown>,
): Promise<User> {
  const res = await client.post('/users', data);
  return res.data.user;
}

export async function searchUsers(
  client: AxiosInstance,
  communityId: string,
  query: string,
): Promise<UserListItem[]> {
  const res = await client.get('/users/search', {
    params: { communityId, query, limit: 10 },
  });
  return res.data.users;
}

export async function getUsersByCommunity(
  client: AxiosInstance,
  communityId: string,
  params?: { page?: number; limit?: number; search?: string },
) {
  const res = await client.get(`/users/community/${communityId}`, { params });
  return res.data;
}

export async function getUser(client: AxiosInstance, id: string) {
  const res = await client.get(`/users/${id}`);
  return res.data.user;
}

export async function blockUser(client: AxiosInstance, id: string) {
  const res = await client.put(`/users/${id}/block`);
  return res.data.user;
}

export async function unblockUser(client: AxiosInstance, id: string) {
  const res = await client.put(`/users/${id}/unblock`);
  return res.data.user;
}

export async function deleteUser(client: AxiosInstance, id: string) {
  const res = await client.delete(`/users/${id}`);
  return res.data;
}

export async function getUserEvents(
  client: AxiosInstance,
  communityId: string,
) {
  const res = await client.get(`/users/events/${communityId}`);
  return res.data;
}
