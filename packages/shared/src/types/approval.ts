export type ApprovalEntityType =
  | 'profile_edit'
  | 'matrimonial'
  | 'business_enquiry'
  | 'business_promotion'
  | 'new_member'
  | 'death_marking'
  | 'family_head_change'
  | 'new_family';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  _id: string;
  entityType: ApprovalEntityType;
  entityId?: string;
  communityId: string;
  requestedBy?: string;
  reviewedBy?: string;
  status: ApprovalStatus;
  payload?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
