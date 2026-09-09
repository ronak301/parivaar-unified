export interface MatrimonialProfile {
  _id: string;
  communityId: string;
  postedBy?: string;
  userId?: string;
  name: string;
  photo?: string;
  biodataFile?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
