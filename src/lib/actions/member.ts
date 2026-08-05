"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/auth/admin-client";
import {
  addToCommunity,
  removeFromCommunity,
} from "@/lib/api/community";
import { createUser, updateUser, searchUser } from "@/lib/api/user";
import { updateAddress } from "@/lib/api/address";
import { createBusiness, updateBusiness } from "@/lib/api/business";
import { createRelation } from "@/lib/api/relationship";
import type { Member } from "@/lib/api/types";

export async function searchMemberAction(phone: string) {
  const api = await getAdminClient();
  const res = await searchUser(phone, api);
  return res.data.data;
}

export async function addExistingFamilyMemberAction(
  communityId: string,
  userId: string,
  parentId: string,
  relationType: string
) {
  const api = await getAdminClient();
  await addToCommunity(communityId, userId, api);
  await createRelation(parentId, userId, relationType, api);
  revalidatePath(`/admin/communities/${communityId}/members/${parentId}`);
}

export async function addExistingMemberAction(
  communityId: string,
  userId: string
) {
  const api = await getAdminClient();
  await addToCommunity(communityId, userId, api);
  revalidatePath(`/admin/communities/${communityId}`);
}

export async function removeMemberAction(communityId: string, userId: string) {
  const api = await getAdminClient();
  await removeFromCommunity(communityId, userId, api);
  revalidatePath(`/admin/communities/${communityId}`);
}

export async function updateMemberLocalityAction(
  addressId: string,
  communityId: string,
  locality: string
) {
  const api = await getAdminClient();
  await updateAddress(addressId, { locality }, api);
  revalidatePath(`/admin/communities/${communityId}`);
}

export interface CreateMemberInput {
  personal: Partial<Member>;
  address: {
    fullAddress?: string;
    locality?: string;
    state?: string;
    city?: string;
    pincode?: string;
  };
  business?: {
    name?: string;
    description?: string;
    phone?: string;
    website?: string;
  };
  communityId: string;
  parentId?: string;
  relationType?: string;
}

export interface UpdateAndAddExistingMemberInput {
  memberId: string;
  communityId: string;
  addressId?: string;
  businessId?: string;
  personal: Partial<Member>;
  address: {
    fullAddress?: string;
    locality?: string;
    state?: string;
    city?: string;
    pincode?: string;
  };
  business?: {
    name?: string;
    description?: string;
    phone?: string;
    website?: string;
  };
}

export async function updateAndAddExistingMemberAction(
  input: UpdateAndAddExistingMemberInput
) {
  const api = await getAdminClient();

  await updateUser(input.memberId, input.personal, api);

  if (input.addressId) {
    await updateAddress(input.addressId, input.address, api);
  }

  if (input.business?.name) {
    if (input.businessId) {
      await updateBusiness(input.businessId, input.business, api);
    } else {
      await createBusiness(
        { ownerId: input.memberId, ...input.business },
        api
      );
    }
  }

  await addToCommunity(input.communityId, input.memberId, api);

  revalidatePath(`/admin/communities/${input.communityId}`);
}

export async function createMemberAction(input: CreateMemberInput) {
  const api = await getAdminClient();
  const created = await createUser(
    { ...input.personal, address: input.address as Member["address"] },
    api
  );
  const newUserId = created.data.id;

  if (input.business?.name) {
    await createBusiness({ ownerId: newUserId, ...input.business }, api);
  }

  await addToCommunity(input.communityId, newUserId, api);

  if (input.parentId) {
    await createRelation(
      input.parentId,
      newUserId,
      input.relationType ?? "Family",
      api
    );
  }

  revalidatePath(`/admin/communities/${input.communityId}`);
  return newUserId;
}

export interface UpdateMemberInput {
  memberId: string;
  communityId: string;
  addressId?: string;
  businessId?: string;
  personal?: Partial<Member>;
  address?: Record<string, unknown>;
  business?: Record<string, unknown>;
}

export async function updateMemberAction(input: UpdateMemberInput) {
  const api = await getAdminClient();

  if (input.personal && Object.keys(input.personal).length > 0) {
    await updateUser(input.memberId, input.personal, api);
  }

  if (input.address && Object.keys(input.address).length > 0) {
    if (input.addressId) {
      await updateAddress(input.addressId, input.address, api);
    }
  }

  if (input.business && Object.keys(input.business).length > 0) {
    if (input.businessId) {
      await updateBusiness(input.businessId, input.business, api);
    } else {
      await createBusiness(
        { ownerId: input.memberId, ...input.business },
        api
      );
    }
  }

  revalidatePath(`/admin/communities/${input.communityId}/members/${input.memberId}`);
}
