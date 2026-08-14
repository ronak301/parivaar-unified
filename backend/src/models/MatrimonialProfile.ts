import mongoose, { Schema, type Document } from 'mongoose';

export interface IMatrimonialProfile extends Document {
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  biodataFile?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const matrimonialProfileSchema = new Schema<IMatrimonialProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    biodataFile: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IMatrimonialProfile>(
  'MatrimonialProfile',
  matrimonialProfileSchema,
);
