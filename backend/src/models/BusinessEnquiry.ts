import mongoose, { Schema, type Document } from 'mongoose';

export interface IBusinessEnquiry extends Document {
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  requirement: string;
  place?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const businessEnquirySchema = new Schema<IBusinessEnquiry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    requirement: { type: String, required: true },
    place: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IBusinessEnquiry>(
  'BusinessEnquiry',
  businessEnquirySchema,
);
