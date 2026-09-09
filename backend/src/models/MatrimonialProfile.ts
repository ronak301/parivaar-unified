import mongoose, { Schema, type Document } from 'mongoose';

export interface IMatrimonialProfile extends Document {
  communityId: mongoose.Types.ObjectId;
  postedBy?: mongoose.Types.ObjectId;
  /** Optional link to a member record (legacy / when the candidate is a member). */
  userId?: mongoose.Types.ObjectId;
  name: string;
  photo?: string;
  biodataFile?: string;
  dob?: Date;
  gender?: string;
  qualification?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const matrimonialProfileSchema = new Schema<IMatrimonialProfile>(
  {
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    photo: String,
    biodataFile: String,
    dob: Date,
    gender: String,
    qualification: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

matrimonialProfileSchema.index({ communityId: 1, status: 1, gender: 1, dob: 1 });

export default mongoose.model<IMatrimonialProfile>(
  'MatrimonialProfile',
  matrimonialProfileSchema,
);
