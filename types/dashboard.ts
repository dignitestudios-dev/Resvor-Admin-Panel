// Dashboard-related TypeScript types for Resvor Admin

export interface DashboardOverview {
  totalLounges: number;
  totalUsers: number;
  totalBartenders: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingEvents: number;
}

export interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface RecentBooking {
  _id: string;
  userId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  guestName: string;
  loungeId?: {
    _id: string;
    name: string;
  };
  status: string;
  amountPaid: number;
  currency: string;
  createdAt: string;
}

export interface RecentPayment {
  _id: string;
  referenceId: string;
  ownerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  ownerModel: string;
  type: string;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface RecentActivity {
  recentUsers: RecentUser[];
  recentBookings: RecentBooking[];
  recentPayments: RecentPayment[];
}

export interface BookingTimeSeriesPoint {
  count: number;
  period: string;
}

export interface RevenueTimeSeriesPoint {
  totalRevenue: number;
  bookingCount: number;
  period: string;
}

export interface TimeSeries {
  interval: string;
  bookingTimeSeries: BookingTimeSeriesPoint[];
  revenueTimeSeries: RevenueTimeSeriesPoint[];
}

export type TimeSeriesInterval = 'daily' | 'weekly' | 'monthly';
