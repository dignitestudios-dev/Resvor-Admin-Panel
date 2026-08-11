// Event-related TypeScript types for Resvor Admin

export type EventStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface EventLounge {
  _id: string;
  name: string;
}

export interface EventGuest {
  _id: string;
  fullName: string;
  email: string;
}

export interface EventPackage {
  _id?: string;
  name?: string;
  price?: number;
}

export interface Event {
  _id: string;
  status: EventStatus;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  title?: string;
  eventType?: string;
  description?: string;
  guestCount?: number;
  budget?: number;
  preferredMusic?: string;
  specialRequest?: string;
  servicePackageIds?: Array<{
    _id: string;
    name: string;
    price: number;
    description?: string;
  }>;
  startDateTime: string;
  endDateTime: string;
  loungeId?: {
    _id: string;
    name: string;
    location?: {
      address: string;
    };
  };
  currency?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventDetail extends Event {}

export interface EventsListParams {
  page?: number;
  limit?: number;
  status?: EventStatus | string;
  search?: string;
  startDate?: string;
  endDate?: string;
  loungeId?: string;
}
