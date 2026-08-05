"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/auth/admin-client";
import { createCommunity, updateCommunity } from "@/lib/api/community";
import type { Community } from "@/lib/api/types";

export async function createCommunityAction(input: {
  name: string;
  description?: string;
  type?: string;
  subType?: string;
}) {
  const api = await getAdminClient();
  await createCommunity({ ...input, status: "Inactive" }, api);
  revalidatePath("/admin");
}

export async function updateCommunityAction(
  id: string,
  input: Partial<Community>
) {
  const api = await getAdminClient();
  await updateCommunity(id, input, api);
  revalidatePath(`/admin/communities/${id}`);
}
