import mongoose, { Schema, type Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  communityId?: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  approvalRequestId?: mongoose.Types.ObjectId;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    type: {
      type: String,
      enum: ['approval_request', 'approval_result', 'birthday_wish', 'general'],
      required: true,
    },
    title: { type: String, required: true },
    body: String,
    data: Schema.Types.Mixed,
    approvalRequestId: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
