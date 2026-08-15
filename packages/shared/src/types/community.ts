export interface Designation {
  id: string;
  memberId?: string;
  name: string;
  photo?: string;
  sansthan?: string;
  designation: string;
  year: string;
}

export interface Community {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  state?: string;
  city?: string;
  status?: string;

  designations?: Designation[];
  localities?: string[];

  createdAt?: string;
  updatedAt?: string;
}
