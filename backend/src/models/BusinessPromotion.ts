import mongoose, { Schema, type Document } from 'mongoose';

export interface IBusinessPromotion extends Document {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  name: string;
  place?: string;
  photo?: string;
  description?: string;
  validity?: Date;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
}

const businessPromotionSchema = new Schema<IBusinessPromotion>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    name: { type: String, required: true },
    place: String,
    photo: String,
    description: String,
    validity: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IBusinessPromotion>(
  'BusinessPromotion',
  businessPromotionSchema,
);
