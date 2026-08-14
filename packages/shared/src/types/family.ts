import type { Sampradaya } from './user';

export interface Family {
  _id: string;
  headId: string;
  sampradaya?: Sampradaya;
  communityIds: string[];
  createdAt?: string;
  updatedAt?: string;
}
