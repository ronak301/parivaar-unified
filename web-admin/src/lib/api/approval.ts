import type { AxiosInstance } from 'axios';
import type { ApprovalRequest, ApprovalStatus } from '@parivaar/shared';

export async function getApprovalRequests(
  client: AxiosInstance,
  communityId: string,
  params?: { status?: ApprovalStatus; page?: number; limit?: number },
): Promise<{
  requests: ApprovalRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const res = await client.get(`/approvals/community/${communityId}`, { params });
  return res.data;
}

export async function reviewApproval(
  client: AxiosInstance,
  id: string,
  status: Extract<ApprovalStatus, 'approved' | 'rejected'>,
): Promise<ApprovalRequest> {
  const res = await client.put(`/approvals/${id}/review`, { status });
  return res.data.request;
}
