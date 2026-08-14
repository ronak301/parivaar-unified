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
