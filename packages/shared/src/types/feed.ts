import type { Business } from './business';

export type FeedItemType = 'matrimonial' | 'business_enquiry' | 'business';

export interface FeedPerson {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  /** Present only when the member has not hidden their number. */
  phone?: string;
}

export interface FeedMatrimonial {
  _id: string;
  name: string;
  photo?: string;
  biodataFile?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  /** Set when the candidate is linked to a member record. */
  userId?: string;
}

export interface FeedEnquiry {
  _id: string;
  requirement: string;
  place?: string;
  user: FeedPerson;
}

export interface FeedItem {
  _id: string;
  type: FeedItemType;
  communityId: string;
  refId: string;
  postedBy?: FeedPerson;
  createdAt: string;
  matrimonial?: FeedMatrimonial;
  enquiry?: FeedEnquiry;
  business?: Business;
}
