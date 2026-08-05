export interface Address {
  id?: string;
  fullAddress?: string;
  locality?: string;
  state?: string;
  city?: string;
  pincode?: string;
  [key: string]: unknown;
}

export interface Business {
  id?: string;
  name?: string;
  description?: string;
  phone?: string;
  website?: string;
  [key: string]: unknown;
}

export interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  email?: string;
  guardianName?: string;
  nativePlace?: string;
  weddingDate?: string;
  education?: string;
  profilePicture?: string;
  isSuperAdmin?: boolean;
  approvalStatus?: boolean;
  parent?: Member | null;
  relatives?: Member[];
  communities?: { id: string; [key: string]: unknown }[];
  address?: Address;
  business?: Business;
  executive?: { roles: string[] };
  [key: string]: unknown;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  type?: string;
  subType?: string;
  logo?: string | null;
  code?: string | null;
  status?: string | null;
  showFamilyMembers?: string | null;
  totalMembers?: string;
  executives?: Member[];
  [key: string]: unknown;
}

export interface GetAllCommunitiesResponse {
  success: boolean;
  communities: Community[];
}

// verifyOtp: POST /user/verifyOtp -> { data: { jwt } }
export interface VerifyOtpResponse {
  data: {
    jwt: string;
    [key: string]: unknown;
  };
}

// getCommunityDetailsForId: GET /community/:id -> flat community object
export type GetCommunityDetailsResponse = Community;

// getCommunityMembersForCommunityId: POST /community/members/:id -> { members: { rows, count } }
export interface GetCommunityMembersResponse {
  members: {
    rows: Member[];
    count: number;
  };
}

// getMemberDetails: GET /user/:id -> { data: { ...user } }
export interface GetMemberDetailsResponse {
  data: Member;
}

// searchUser: POST /user/search -> { data: { count, rows } }
export interface SearchUserResponse {
  data: {
    count: number;
    rows: Member[];
  };
}

// createUser: POST /user/new -> flat created user object (has .id)
export type CreateUserResponse = Member;

// addToCommunity / removeFromCommunity -> { success }
export interface SuccessResponse {
  success: boolean;
  [key: string]: unknown;
}

// Firestore `config` collection — dropdown option lists
export interface ConfigItem {
  id: string;
  label: string;
  subTypes?: ConfigItem[];
}

export interface RemoteConfig {
  id: string;
  BloodGroups?: ConfigItem[];
  BusinessTypes?: ConfigItem[];
  Cities?: ConfigItem[];
  CommunityTypes?: ConfigItem[];
  FamilyMemberRelationshipTypes?: ConfigItem[];
  Gender?: ConfigItem[];
  Localities?: ConfigItem[];
  State?: ConfigItem[];
  [key: string]: unknown;
}
