import type { AxiosInstance } from 'axios';
import type { Business } from '@parivaar/shared';

export async function createBusiness(
  client: AxiosInstance,
  data: Record<string, unknown>,
): Promise<Business> {
  const res = await client.post('/businesses', data);
  return res.data.business;
}

export async function updateBusiness(
  client: AxiosInstance,
  id: string,
  data: Record<string, unknown>,
): Promise<Business> {
  const res = await client.put(`/businesses/${id}`, data);
  return res.data.business;
}

export async function getBusinessByOwner(
  client: AxiosInstance,
  userId: string,
): Promise<Business | null> {
  const res = await client.get(`/businesses/owner/${userId}`);
  return res.data.business;
}
