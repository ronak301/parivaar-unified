import type { KeyValuePair } from './blood-groups';

export const Gender: KeyValuePair[] = [
  { id: 'Male', label: 'Male' },
  { id: 'Female', label: 'Female' },
];

export const GenderIds = Gender.map((g) => g.id);
