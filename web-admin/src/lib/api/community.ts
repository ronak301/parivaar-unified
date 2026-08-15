import type { AxiosInstance } from 'axios';
import type { Community } from '@parivaar/shared';

export async function getCommunities(
  client: AxiosInstance,
): Promise<Community[]> {
  const res = await client.get('/communities');
  return res.data.communities;
}

export async function getCommunity(
  client: AxiosInstance,
  id: string,
): Promise<Community> {
  const res = await client.get(`/communities/${id}`);
  return res.data.community;
}

export async function updateCommunity(
  client: AxiosInstance,
  id: string,
  data: Partial<Community>,
): Promise<Community> {
  const res = await client.put(`/communities/${id}`, data);
  return res.data.community;
}

export async function createCommunity(
  client: AxiosInstance,
  data: Partial<Community>,
): Promise<Community> {
  const res = await client.post('/communities', data);
  return res.data.community;
}

export async function deleteCommunity(
  client: AxiosInstance,
  id: string,
): Promise<void> {
  await client.delete(`/communities/${id}`);
}
