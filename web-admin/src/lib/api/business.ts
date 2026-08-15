import type { AxiosInstance } from 'axios';
import type { Business } from '@parivaar/shared';

export async function createBusiness(
  client: AxiosInstance,
  data: Record<string, unknown>,
): Promise<Business> {
  const res = await client.post('/businesses', data);
  return res.data.business;
}
