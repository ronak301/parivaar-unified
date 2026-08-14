export type NotificationType =
  | 'approval_request'
  | 'approval_result'
  | 'birthday_wish'
  | 'general';

export interface Notification {
  _id: string;
  userId: string;
  communityId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  approvalRequestId?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}
