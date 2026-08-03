// Lounge-related TypeScript types for Resvor Admin

export interface OperatingHours {
  open: string;
  close: string;
}

export interface LoungeLocation {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export interface LoungeOwner {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
}

export interface Lounge {
  _id: string;
  name: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  location?: LoungeLocation;
  city?: string;
  state?: string;
  country?: string;
  operatingHours?: OperatingHours;
  owner?: LoungeOwner;
  ownerId?: LoungeOwner;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  coverImage?: string;
  description?: string;
}

export interface LoungeDetail extends Lounge {
  bartenders?: Array<{
    _id: string;
    fullName: string;
    email: string;
    status?: string;
  }>;
  bookings?: Array<{
    _id: string;
    status: string;
    createdAt: string;
  }>;
  events?: Array<{
    _id: string;
    name?: string;
    status: string;
    eventDate: string;
  }>;
}

export interface LoungesListParams {
  page?: number;
  limit?: number;
  search?: string;
}
