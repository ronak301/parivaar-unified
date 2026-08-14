export interface RelationshipType {
  id: string;
  label: string;
  reverse: { id: string; label: string };
}

export const FamilyMemberRelationshipTypes: RelationshipType[] = [
  { id: 'Father', label: 'Father', reverse: { id: 'Son', label: 'Son' } },
  { id: 'Mother', label: 'Mother', reverse: { id: 'Son', label: 'Son' } },
  { id: 'Husband', label: 'Husband', reverse: { id: 'Wife', label: 'Wife' } },
  { id: 'Wife', label: 'Wife', reverse: { id: 'Husband', label: 'Husband' } },
  { id: 'Son', label: 'Son', reverse: { id: 'Parent', label: 'Parent' } },
  { id: 'Daughter', label: 'Daughter', reverse: { id: 'Parent', label: 'Parent' } },
  { id: 'Sister', label: 'Sister', reverse: { id: 'Brother', label: 'Brother' } },
  { id: 'Brother', label: 'Brother', reverse: { id: 'Brother', label: 'Brother' } },
];

export const RelationshipTypeIds = FamilyMemberRelationshipTypes.map((rt) => rt.id);
