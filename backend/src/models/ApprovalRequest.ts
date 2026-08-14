import mongoose, { Schema, type Document } from 'mongoose';

export interface IApprovalRequest extends Document {
  entityType: string;
  entityId?: string;
  communityId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  payload?: Record<string, unknown>;
}

const approvalRequestSchema = new Schema<IApprovalRequest>(
  {
    entityType: {
      type: String,
      enum: [
        'profile_edit',
        'matrimonial',
        'business_enquiry',
        'business_promotion',
        'new_member',
        'death_marking',
        'family_head_change',
      ],
      required: true,
    },
    entityId: String,
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    payload: Schema.Types.Mixed,
  },
  { timestamps: true },
);

approvalRequestSchema.index({ communityId: 1, status: 1 });

export default mongoose.model<IApprovalRequest>(
  'ApprovalRequest',
  approvalRequestSchema,
);
