export type ApprovalEntityType =
  | 'profile_edit'
  | 'matrimonial'
  | 'business_enquiry'
  | 'business_promotion'
  | 'business'
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
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Shape of `payload` for a `profile_edit` approval request. */
export interface ProfileEditPayload {
  changes: Record<string, unknown>;
  /** Snapshot of the same fields at submission time, for the admin diff view. */
  previous: Record<string, unknown>;
}
