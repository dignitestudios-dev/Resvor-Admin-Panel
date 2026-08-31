// Flyer-related TypeScript types for Resvor Admin

export type FlyerChannel = 'email' | 'sms';
export type FlyerRecipientStatus = 'DELIVERED' | 'FAILED' | 'PENDING';

export interface FlyerSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // used by LoungeManager fallback
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface FlyerLounge {
  _id: string;
  name: string;
  businessEmail?: string;
  location?:
    | string
    | {
        address?: string;
        coordinates?: {
          lat: number;
          lng: number;
        };
      };
}

export interface FlyerImage {
  _id?: string;
  url?: string;
  secure_url?: string;
  path?: string;
  location?: string;
  fileUrl?: string;
  src?: string;
  mediaUrl?: string;
}

export interface FlyerRecipientSummaryItem {
  status: FlyerRecipientStatus;
  count: number;
}

export interface FlyerRecipientLog {
  value: string;
  status: FlyerRecipientStatus;
  attempts: number;
  lastAttemptedAt: string | null;
  failureReason: string | null;
}

export interface Flyer {
  _id: string;
  senderId?: FlyerSender;
  senderModel: 'User' | 'LoungeManager';
  loungeId?: FlyerLounge | null;
  image?: FlyerImage | string | null;
  channel: FlyerChannel;
  additionalInfo?: string;
  message?: string;
  campaignMessage?: string;
  description?: string;
  content?: string;
  text?: string;
  body?: string;
  caption?: string;
  title?: string;
  recipientSummary?: FlyerRecipientSummaryItem[];
  recipients?: FlyerRecipientLog[];
  createdAt: string;
  updatedAt: string;
}

export interface FlyerAnalytics {
  totals: {
    totalCampaigns: number;
    totalRecipients: number;
  };
  deliveryRate: string;
  byChannel: Array<{
    channel: FlyerChannel;
    campaignCount: number;
    totalRecipients: number;
  }>;
  byRecipientStatus: Array<{
    status: FlyerRecipientStatus;
    count: number;
  }>;
}

export interface FlyersListParams {
  page?: number;
  limit?: number;
  channel?: FlyerChannel;
}
