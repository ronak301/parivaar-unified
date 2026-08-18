import type { AxiosInstance } from 'axios';
import type { Family } from '@parivaar/shared';

export async function createFamily(
  client: AxiosInstance,
  data: { headId: string; communityIds?: string[]; sampradaya?: string },
): Promise<Family> {
  const res = await client.post('/families', data);
  return res.data.family;
}

export async function batchCreateFamily(
  client: AxiosInstance,
  data: {
    head: Record<string, unknown>;
    communityIds: string[];
    sampradaya?: string;
    business?: Record<string, unknown>;
    members?: Array<{
      firstName: string;
      lastName?: string;
      phone?: string;
      relation?: string;
      relativeIndex?: number;
    }>;
  },
) {
  const res = await client.post('/families/batch-create', data);
  return res.data;
}

export async function addFamilyMember(
  client: AxiosInstance,
  familyId: string,
  data: { userId: string; relation?: string; relativeId?: string },
) {
  const res = await client.post(`/families/${familyId}/add-member`, data);
  return res.data.user;
}

export async function addFamilyMembers(
  client: AxiosInstance,
  familyId: string,
  data: {
    members: Array<{
      firstName: string;
      lastName?: string;
      phone?: string;
      relation: string;
      relativeId?: string;
      relativeIndex?: number;
    }>;
  },
) {
  const res = await client.post(`/families/${familyId}/add-members`, data);
  return res.data;
}

export async function getFamilyTree(client: AxiosInstance, familyId: string) {
  const res = await client.get(`/families/${familyId}/tree`);
  return res.data;
}
