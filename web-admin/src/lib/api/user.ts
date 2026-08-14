import type { AxiosInstance } from 'axios';

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

export async function getUserEvents(
  client: AxiosInstance,
  communityId: string,
) {
  const res = await client.get(`/users/events/${communityId}`);
  return res.data;
}
