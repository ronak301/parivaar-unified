import mongoose, { Schema, type Document } from 'mongoose';

export type FeedItemType = 'matrimonial' | 'business_enquiry' | 'business';

export interface IFeedItem extends Document {
  communityId: mongoose.Types.ObjectId;
  type: FeedItemType;
  refId: mongoose.Types.ObjectId;
  postedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Only ever written from the approval effect — nothing reaches the feed
// without an admin approving it first.
const feedItemSchema = new Schema<IFeedItem>(
  {
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    type: { type: String, enum: ['matrimonial', 'business_enquiry', 'business'], required: true },
    refId: { type: Schema.Types.ObjectId, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

feedItemSchema.index({ communityId: 1, createdAt: -1 });
feedItemSchema.index({ type: 1, refId: 1 }, { unique: true });

export default mongoose.model<IFeedItem>('FeedItem', feedItemSchema);
