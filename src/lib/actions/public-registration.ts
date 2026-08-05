"use server";

import { z } from "zod";
import client from "@/lib/api/client";
import { addToCommunity } from "@/lib/api/community";
import { createUser, searchUser } from "@/lib/api/user";
import { createBusiness } from "@/lib/api/business";
import { createRelation } from "@/lib/api/relationship";
import type { Member } from "@/lib/api/types";

const phoneSchema = z.string().regex(/^\d{10}$/, "Phone number must be 10 digits");

export async function checkPhoneAction(
  phone: string,
  communityId: string
): Promise<
  | { status: "already-member" }
  | { status: "existing"; user: Member }
  | { status: "new" }
> {
  const parsedPhone = phoneSchema.parse(phone);
  const res = await searchUser(parsedPhone, client);
  const user = res.data.data.rows[0];
  if (!user) return { status: "new" };
  const alreadyMember = user.communities?.some((c) => c.id === communityId);
  if (alreadyMember) return { status: "already-member" };
  return { status: "existing", user };
}

const addressSchema = z.object({
  fullAddress: z.string().max(500).optional(),
  locality: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").optional().or(z.literal("")),
});

const headSchema = z.object({
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  phone: phoneSchema,
  email: z.string().email().max(100).optional().or(z.literal("")),
  dob: z.string().max(20).optional().or(z.literal("")),
  guardianName: z.string().max(30).optional().or(z.literal("")),
  nativePlace: z.string().max(100).optional().or(z.literal("")),
  gender: z.string().max(30).optional().or(z.literal("")),
  weddingDate: z.string().max(20).optional().or(z.literal("")),
  education: z.string().max(200).optional().or(z.literal("")),
  bloodGroup: z.string().max(10).optional().or(z.literal("")),
  profilePicture: z.string().max(2000).optional().or(z.literal("")),
  address: addressSchema,
  business: z
    .object({
      name: z.string().max(100),
      description: z.string().max(1000).optional().or(z.literal("")),
      phone: phoneSchema.optional().or(z.literal("")),
      website: z.string().max(300).optional().or(z.literal("")),
    })
    .optional(),
});

const familyMemberSchema = z.object({
  relationType: z.string().min(1).max(50),
  firstName: z.string().min(1).max(30),
  lastName: z.string().min(1).max(30),
  guardianName: z.string().max(30).optional().or(z.literal("")),
  gender: z.string().max(30).optional().or(z.literal("")),
  bloodGroup: z.string().max(10).optional().or(z.literal("")),
  education: z.string().max(200).optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
});

const submitSchema = z.object({
  communityId: z.string().min(1),
  head: headSchema,
  familyMembers: z.array(familyMemberSchema).max(30),
});

export type SubmitFamilyRegistrationInput = z.infer<typeof submitSchema>;

export async function submitFamilyRegistrationAction(
  input: SubmitFamilyRegistrationInput
) {
  const parsed = submitSchema.parse(input);
  const h = parsed.head;

  const created = await createUser(
    {
      firstName: h.firstName,
      lastName: h.lastName,
      phone: h.phone,
      email: h.email || undefined,
      dob: h.dob || undefined,
      guardianName: h.guardianName || undefined,
      nativePlace: h.nativePlace || undefined,
      gender: h.gender || undefined,
      weddingDate: h.weddingDate || undefined,
      education: h.education || undefined,
      bloodGroup: h.bloodGroup || undefined,
      profilePicture: h.profilePicture || undefined,
      isAccountManager: true,
      parent: null,
      address: {
        fullAddress: h.address.fullAddress || undefined,
        locality: h.address.locality || undefined,
        state: h.address.state || undefined,
        city: h.address.city || undefined,
        pincode: h.address.pincode || undefined,
      },
    },
    client
  );
  const headId = created.data.id;
  const headAddress = h.address;
  const headNativePlace = h.nativePlace || undefined;

  if (h.business?.name) {
    await createBusiness(
      {
        ownerId: headId,
        name: h.business.name,
        description: h.business.description || undefined,
        phone: h.business.phone || undefined,
        website: h.business.website || undefined,
      },
      client
    );
  }

  await addToCommunity(parsed.communityId, headId, client);

  for (const member of parsed.familyMembers) {
    const created = await createUser(
      {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone || undefined,
        guardianName: member.guardianName || undefined,
        gender: member.gender || undefined,
        bloodGroup: member.bloodGroup || undefined,
        education: member.education || undefined,
        nativePlace: headNativePlace,
        isAccountManager: false,
        parentNode: headId,
        address: {
          fullAddress: headAddress.fullAddress || undefined,
          locality: headAddress.locality || undefined,
          state: headAddress.state || undefined,
          city: headAddress.city || undefined,
        },
      },
      client
    );
    const memberId = created.data.id;
    await addToCommunity(parsed.communityId, memberId, client);
    await createRelation(headId, memberId, member.relationType, client);
  }

  return { headId };
}
