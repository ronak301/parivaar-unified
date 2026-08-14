export interface Business {
  _id: string;
  ownerId: string;
  communityId: string;
  name?: string;
  category?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;
  instagramProfile?: string;
  linkedinProfile?: string;
  photos?: string[];
  logo?: string;
  googleMapsLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessEnquiry {
  _id: string;
  userId: string;
  communityId: string;
  requirement: string;
  place?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessPromotion {
  _id: string;
  businessId: string;
  userId: string;
  communityId: string;
  name: string;
  place?: string;
  photo?: string;
  description?: string;
  validity?: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
