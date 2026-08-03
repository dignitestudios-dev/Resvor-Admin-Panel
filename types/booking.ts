// Booking-related TypeScript types for Resvor Admin

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface BookingUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
}

export interface BookingLounge {
  _id: string;
  name: string;
  businessEmail?: string;
  location?: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
}

export interface BookingTable {
  _id: string;
  code: string;
  type: string;
  capacity: number;
}

export interface BookingPackage {
  _id: string;
  name: string;
  price: number;
  description?: string;
}

export interface BookingEscrow {
  _id: string;
  sourceId?: string;
  sourceModel?: string;
  userId?: string;
  managerId?: string;
  loungeId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  autoReleaseAt?: string;
  disputeId?: string | null;
  releasedAt?: string;
  transactionId?: string;
  releaseTransactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  userId?: BookingUser;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  loungeId?: BookingLounge;
  tableIds?: BookingTable[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount?: number;
  childrenCount?: number;
  specialRequest?: string;
  servicePackageIds?: BookingPackage[];
  status: BookingStatus;
  stripePaymentIntentId?: string | null;
  amountPaid?: number;
  currency?: string;
  paidAt?: string | null;
  escrowId?: string | BookingEscrow | null;
  disputeId?: string | null;
  reminderSent?: boolean;
  cancelledAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingDetail extends Booking {}

export interface BookingsListParams {
  page?: number;
  limit?: number;
  status?: BookingStatus | string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
