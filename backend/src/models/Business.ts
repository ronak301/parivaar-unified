import mongoose, { Schema, type Document } from 'mongoose';

export interface IBusiness extends Document {
  ownerId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  name?: string;
  category?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  instagramProfile?: string;
  linkedinProfile?: string;
  photos: string[];
  logo?: string;
  googleMapsLink?: string;
}

const businessSchema = new Schema<IBusiness>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    name: String,
    category: String,
    phone: String,
    website: String,
    description: String,
    address: String,
    instagramProfile: String,
    linkedinProfile: String,
    photos: {
      type: [String],
      validate: [(val: string[]) => val.length <= 2, 'Maximum 2 photos allowed'],
    },
    logo: String,
    googleMapsLink: String,
  },
  { timestamps: true },
);

businessSchema.index({ communityId: 1 });
businessSchema.index(
  { name: 'text', category: 'text' },
  { name: 'business_text_search' },
);

export default mongoose.model<IBusiness>('Business', businessSchema);
