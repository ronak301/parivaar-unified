export interface KeyValuePair {
  id: string;
  label: string;
}

export const BloodGroups: KeyValuePair[] = [
  { id: 'A_POSITIVE', label: 'A+' },
  { id: 'A_NEGATIVE', label: 'A-' },
  { id: 'B_POSITIVE', label: 'B+' },
  { id: 'B_NEGATIVE', label: 'B-' },
  { id: 'O_POSITIVE', label: 'O+' },
  { id: 'O_NEGATIVE', label: 'O-' },
  { id: 'AB_POSITIVE', label: 'AB+' },
  { id: 'AB_NEGATIVE', label: 'AB-' },
];

export const BloodGroupIds = BloodGroups.map((bg) => bg.id);
