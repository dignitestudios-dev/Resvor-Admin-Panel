// Bartender-related TypeScript types for Resvor Admin

export interface BartenderLounge {
  _id: string;
  name: string;
  businessEmail?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  location?: {
    address: string;
  };
}

export interface Bartender {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  isSuspended: boolean;
  isEmailVerified?: boolean;
  loungeId?: BartenderLounge;
  createdAt: string;
  updatedAt?: string;
}

export type ShiftStatus =
  | 'published'
  | 'completed'
  | 'draft'
  | 'expired'
  | 'pending';

export interface Shift {
  _id: string;
  role?: string;
  startDateTime: string;
  endDateTime: string;
  status: ShiftStatus;
  loungeId?: {
    _id: string;
    name: string;
  };
  instructions?: string;
}

export interface ShiftRequest {
  _id: string;
  type: string; // 'shift_swap' or 'time_off'
  requestorShiftId?: {
    _id: string;
    role?: string;
    startDateTime?: string;
    endDateTime?: string;
  };
  targetShiftId?: {
    _id: string;
    role?: string;
    startDateTime?: string;
    endDateTime?: string;
  };
  startDate?: string;
  endDate?: string;
  reason?: string;
  status: string;
  createdAt: string;
}

export interface BartenderDetail {
  bartender: Bartender;
  shifts?: Shift[];
  shiftRequests?: ShiftRequest[];
}

export interface BartendersListParams {
  page?: number;
  limit?: number;
  loungeId?: string;
  search?: string;
  isSuspended?: boolean;
}
