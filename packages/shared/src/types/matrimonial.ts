export interface MatrimonialProfile {
  _id: string;
  userId: string;
  communityId: string;
  biodataFile?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
