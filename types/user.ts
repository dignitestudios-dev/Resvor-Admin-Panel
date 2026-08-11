// User-related TypeScript types for Resvor Admin

export interface UserSubscription {
  plan?: string;
  status?: string;
  expiresAt?: string;
}

export interface UserPreferences {
  musicGenres?: string[];
  loungeTypes?: string[];
  preferredExperiences?: string[];
}

export interface UserSpecialDate {
  occasion?: string;
  date?: string;
  _id?: string;
}

export interface User {
  _id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string | null;
  role?: string;
  userType?: 'User' | 'LoungeManager' | string;
  isLoungeManager?: boolean;
  loungeId?: string | { _id: string; name: string };
  isEmailVerified: boolean;
  isPhoneNumberVerified?: boolean;
  isProfileCompleted?: boolean;
  isSuspended: boolean;
  isDeleted?: boolean;
  subscription?: UserSubscription;
  isSubscribed?: boolean;
  stripeCustomerId?: string | null;
  profileImage?: string;
  profilePicture?: {
    _id?: string;
    url?: string;
    path?: string;
    location?: string;
    fileUrl?: string;
    secure_url?: string;
  } | string | null;
  preferences?: UserPreferences;
  specialDates?: UserSpecialDate[];
  onboardingStep?: string;
  isNotificationEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserDetail extends User {
  bookings?: Array<{
    _id: string;
    status: string;
    totalAmount?: number;
    createdAt: string;
  }>;
  payments?: Array<{
    _id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  isSuspended?: boolean;
}
