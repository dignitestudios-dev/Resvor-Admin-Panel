// Payment-related TypeScript types for Resvor Admin

export type PaymentStatus =
  | 'IN_PROCESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'IN_TRANSIT'
  | 'WITHHELD'
  | 'CANCELLED';

export type PaymentPurpose =
  | 'WALLET_TOPUP'
  | 'TABLE_BOOKING'
  | 'EVENT_BOOKING'
  | 'FLYER_CAMPAIGN'
  | 'PLATFORM_FEE'
  | 'BOOKING_PAYMENT'
  | 'EVENT_PAYMENT'
  | 'WITHDRAWAL';

export interface PaymentOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
}

export interface Payment {
  _id: string;
  referenceId: string;
  traceId?: string;
  walletId?: {
    _id: string;
    ownerId?: string;
    currency: string;
  };
  ownerId?: PaymentOwner;
  ownerModel?: string;
  type: string; // RELEASE, BOOKING_CHARGE, etc.
  purpose: PaymentPurpose;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  stripePaymentIntentId?: string | null;
  metadata?: {
    escrowId?: string;
    sourceId?: string;
    sourceModel?: string;
    bookingId?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentAnalytics {
  interval: string;
  totals: {
    totalAmount: number;
    totalCount: number;
  };
  byPurpose: Array<{
    totalAmount: number;
    count: number;
    purpose: string;
  }>;
  timeSeries: Array<{
    totalAmount: number;
    count: number;
    period: string;
  }>;
}

export interface PaymentsListParams {
  page?: number;
  limit?: number;
  status?: string;
  purpose?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
