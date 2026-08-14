import mongoose, { Schema, type Document } from 'mongoose';
import crypto from 'crypto';

const addressSchema = new Schema(
  {
    fullAddress: String,
    state: String,
    city: String,
    district: String,
    pincode: String,
    locality: String,
  },
  { _id: false },
);

export interface IUser extends Document {
  enrollmentId: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
  guardianName?: string;
  dob?: Date;
  weddingDate?: Date;
  isMarried?: boolean;
  gender?: string;
  phone?: string;
  email?: string;
  education?: string;
  specialEducation?: string;
  bloodGroup?: string;
  hobbies?: string;
  achievements?: string;
  nativePlace?: string;
  nativeDistrict?: string;
  nanihaal?: string;
  aadharLast4?: string;
  address?: {
    fullAddress?: string;
    state?: string;
    city?: string;
    district?: string;
    pincode?: string;
    locality?: string;
  };
  familyId?: mongoose.Types.ObjectId;
  isFamilyHead: boolean;
  fatherId?: mongoose.Types.ObjectId;
  motherId?: mongoose.Types.ObjectId;
  spouseId?: mongoose.Types.ObjectId;
  childrenIds: mongoose.Types.ObjectId[];
  privateFields: string[];
  isAlive: boolean;
  demiseDate?: Date;
  role: 'super_admin' | 'community_admin' | 'member';
  communityIds: mongoose.Types.ObjectId[];
  pushTokens: string[];
  lastSeen?: Date;
}

const userSchema = new Schema<IUser>(
  {
    enrollmentId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: String,
    fullName: String,
    profilePicture: String,
    guardianName: String,
    dob: Date,
    weddingDate: Date,
    isMarried: Boolean,
    gender: String,
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    education: String,
    specialEducation: String,
    bloodGroup: String,
    hobbies: String,
    achievements: String,
    nativePlace: String,
    nativeDistrict: String,
    nanihaal: String,
    aadharLast4: {
      type: String,
      match: /^[0-9]{4}$/,
    },
    address: addressSchema,
    familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
    isFamilyHead: { type: Boolean, default: false },
    fatherId: { type: Schema.Types.ObjectId, ref: 'User' },
    motherId: { type: Schema.Types.ObjectId, ref: 'User' },
    spouseId: { type: Schema.Types.ObjectId, ref: 'User' },
    childrenIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    privateFields: [String],
    isAlive: { type: Boolean, default: true },
    demiseDate: Date,
    role: {
      type: String,
      enum: ['super_admin', 'community_admin', 'member'],
      default: 'member',
    },
    communityIds: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    pushTokens: [String],
    lastSeen: Date,
  },
  { timestamps: true },
);

userSchema.index({ communityIds: 1 });
userSchema.index({ familyId: 1 });
userSchema.index(
  { firstName: 'text', lastName: 'text', fullName: 'text' },
  { name: 'user_text_search' },
);

async function generateEnrollmentId(): Promise<string> {
  const User = mongoose.model<IUser>('User');
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = String(crypto.randomInt(10000000, 99999999));
    const exists = await User.exists({ enrollmentId: id });
    if (!exists) return id;
  }
  throw new Error('Failed to generate unique enrollment ID after 10 attempts');
}

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.enrollmentId) {
    this.enrollmentId = await generateEnrollmentId();
  }
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = [this.firstName, this.lastName].filter(Boolean).join(' ');
  }
  next();
});

export default mongoose.model<IUser>('User', userSchema);
