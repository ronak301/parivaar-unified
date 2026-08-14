import mongoose, { Schema, type Document } from 'mongoose';

const designationSchema = new Schema(
  {
    name: { type: String, required: true },
    sansthan: String,
    designation: { type: String, required: true },
    year: { type: String, required: true },
  },
  { _id: false },
);

const featuresSchema = new Schema(
  {
    welcomeScreen: { type: Boolean, default: false },
    aboutScreenExtraInfo: { type: Boolean, default: false },
    showOnlyHeadsInAllMembers: { type: Boolean, default: false },
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
  type?: string;
  subType?: string;
  showFamilyMembers: string;
  designations: Array<{
    name: string;
    sansthan?: string;
    designation: string;
    year: string;
  }>;
  features: {
    welcomeScreen: boolean;
    aboutScreenExtraInfo: boolean;
    showOnlyHeadsInAllMembers: boolean;
  };
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
    status: { type: String, default: 'Inactive' },
    type: String,
    subType: String,
    showFamilyMembers: {
      type: String,
      enum: ['ALL', 'SINGLE', 'SPOUSE', 'SPOUSE_AND_KIDS'],
      default: 'ALL',
    },
    designations: [designationSchema],
    features: { type: featuresSchema, default: () => ({}) },
    localities: [String],
  },
  { timestamps: true },
);

export default mongoose.model<ICommunity>('Community', communitySchema);
