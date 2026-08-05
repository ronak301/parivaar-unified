export type Business = {
  id: string;
  name?: string;
  type?: string;
  subType?: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
};

export type Relative = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  phone: string;
  education: string;
  bloodGroup?: string;
  business?: {
    id: string;
    name: string;
    type: string;
  };
  relationship?: {
    id: string;
    type: string;
  };
};

export type Address = {
  id: string;
  userId?: string;
  fullAddress?: string;
  pincode?: string;
  city?: string;
  locality: string;
  state?: string;
};

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  guardianName?: string;
  bloodGroup: string;
  profilePicture?: string;
  imagePath?: string;
  phone?: string;
  nativePlace?: string;
  dob?: string;
  education?: string;
  business?: Business;
  weddingDate?: string;
  email?: string;
  authId?: string;
  lastSeen?: string;
  isSuperAdmin?: string;
  relatives?: Relative[];
  address: Address;
  parent: any;
  root: any;
};

export type Executive = Member & {
  executive: {
    id?: string;
    roles?: string[];
  };
};

export type FamilyDetailsType = "ALL" | "SINGLE" | "SPOUSE" | "SPOUSE&KIDS";

export type Community = {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  totalMembers?: string;
  status?: string;
  showFamilyMembers?: FamilyDetailsType;
};
