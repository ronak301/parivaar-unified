import mongoose, { Schema, type Document } from 'mongoose';

export interface IFamily extends Document {
  headId: mongoose.Types.ObjectId;
  sampradaya?: 'Sthanak' | 'Mandrimargi' | 'Terapanthi';
  communityIds: mongoose.Types.ObjectId[];
}

const familySchema = new Schema<IFamily>(
  {
    headId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sampradaya: {
      type: String,
      enum: ['Sthanak', 'Mandrimargi', 'Terapanthi'],
    },
    communityIds: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
  },
  { timestamps: true },
);

export default mongoose.model<IFamily>('Family', familySchema);
