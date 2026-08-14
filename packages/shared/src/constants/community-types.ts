import type { KeyValuePair } from './blood-groups';

export interface CommunityType {
  id: string;
  label: string;
  subTypes?: { id: string; label: string }[];
}

export const CommunityTypes: CommunityType[] = [
  {
    id: 'Jain',
    label: 'Jain',
    subTypes: [
      { id: 'Terapanth', label: 'Terapanth' },
      { id: 'All', label: 'All' },
    ],
  },
  { id: 'All', label: 'All' },
];

export const CommunityStatus: KeyValuePair[] = [
  { id: 'Pending', label: 'Pending' },
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
];
