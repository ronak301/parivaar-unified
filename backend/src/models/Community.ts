import mongoose, { Schema, type Document } from 'mongoose';

const designationSchema = new Schema(
  {
    id: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    photo: String,
    sansthan: String,
    designation: { type: String, required: true },
    year: { type: String, required: true },
  },
  { _id: false },
);

export interface ICommunity extends Document {
  name: string;
  description?: string;
  logo?: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  state?: string;
  city?: string;
  status: string;
  designations: Array<{
    id: string;
    memberId?: mongoose.Types.ObjectId;
    name: string;
    photo?: string;
    sansthan?: string;
    designation: string;
    year: string;
  }>;
  localities: string[];
}

const communitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true },
    description: String,
    logo: String,
    contactPersonName: String,
    contactPersonNumber: String,
    state: String,
    city: String,
    status: { type: String, default: 'Pending' },
    designations: [designationSchema],
    localities: [String],
  },
  { timestamps: true },
);

export default mongoose.model<ICommunity>('Community', communitySchema);
