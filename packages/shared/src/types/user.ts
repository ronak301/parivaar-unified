export interface Address {
  fullAddress?: string;
  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  locality?: string;
}

export type UserRole = 'super_admin' | 'community_admin' | 'member';

export type Sampradaya = 'Sthanak' | 'Mandrimargi' | 'Terapanthi';

export interface User {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  guardianName?: string;
  dob?: string;
  weddingDate?: string;
  isMarried?: boolean;
  gender?: string;
  phone?: string;
  email?: string;
  education?: string;
  specialEducation?: string;
  bloodGroup?: string;
  hobbies?: string;
  achievements?: string;
  nativePlace?: string;
  nativeDistrict?: string;
  nanihaal?: string;
  aadharLast4?: string;

  address?: Address;

  familyId?: string;
  isFamilyHead?: boolean;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childrenIds?: string[];
  siblingIds?: string[];

  privateFields?: string[];

  isAlive?: boolean;
  demiseDate?: string;

  showPhoneInCommunity?: boolean;
  showBusinessInCommunity?: boolean;

  role: UserRole;
  communityIds?: string[];

  pushTokens?: string[];
  lastSeen?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface UserListItem {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  bloodGroup?: string;
  education?: string;
  dob?: string;
  gender?: string;
  isFamilyHead?: boolean;
  address?: Pick<Address, 'locality' | 'city'>;
}

export interface FamilyMember {
  _id: string;
  firstName: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  relation?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  education?: string;
}
