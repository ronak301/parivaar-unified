export interface UserData {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dob?: string;
  guardianName?: string;
  nativePlace?: string;
  nativeDistrict?: string;
  nanihaal?: string;
  education?: string;
  specialEducation?: string;
  bloodGroup?: string;
  hobbies?: string;
  achievements?: string;
  aadharLast4?: string;
  weddingDate?: string;
  isFamilyHead?: boolean;
  isAlive?: boolean;
  demiseDate?: string;
  isBlocked?: boolean;
  blockedAt?: string;
  familyId?: { _id: string; headId: string; sampradaya?: string };
  communityIds?: Array<{ _id: string; name: string }>;
  address?: {
    fullAddress?: string;
    state?: string;
    city?: string;
    district?: string;
    locality?: string;
    pincode?: string;
  };
}

export interface FamilyTreeMember {
  _id: string;
  enrollmentId: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  childrenIds?: string[];
  isFamilyHead?: boolean;
  isAlive?: boolean;
  demiseDate?: string;
}
