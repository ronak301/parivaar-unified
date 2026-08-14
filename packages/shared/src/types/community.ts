export type FamilyDetailsType = 'ALL' | 'SINGLE' | 'SPOUSE' | 'SPOUSE_AND_KIDS';

export interface Designation {
  name: string;
  sansthan?: string;
  designation: string;
  year: string;
}

export interface CommunityFeatures {
  welcomeScreen?: boolean;
  aboutScreenExtraInfo?: boolean;
  showOnlyHeadsInAllMembers?: boolean;
}

export interface Community {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  state?: string;
  city?: string;
  status?: string;
  type?: string;
  subType?: string;

  showFamilyMembers?: FamilyDetailsType;
  designations?: Designation[];
  features?: CommunityFeatures;
  localities?: string[];

  createdAt?: string;
  updatedAt?: string;
}
