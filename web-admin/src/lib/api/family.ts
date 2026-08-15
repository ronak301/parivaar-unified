import type { AxiosInstance } from 'axios';
import type { Family } from '@parivaar/shared';

export async function createFamily(
  client: AxiosInstance,
  data: { headId: string; communityIds?: string[] },
): Promise<Family> {
  const res = await client.post('/families', data);
  return res.data.family;
}

export async function addFamilyMember(
  client: AxiosInstance,
  familyId: string,
  data: { userId: string; relation?: string; relativeId?: string },
) {
  const res = await client.post(`/families/${familyId}/add-member`, data);
  return res.data.user;
}
