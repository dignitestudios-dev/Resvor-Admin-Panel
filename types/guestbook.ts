import type { Pagination } from './common';

export interface GuestbookSpecialDate {
  _id?: string;
  title: string;
  date: string;
}

export interface GuestbookPhoto {
  _id?: string;
  location?: string;
  url?: string;
  secure_url?: string;
}

export interface GuestbookLounge {
  _id: string;
  name: string;
}

export interface GuestbookEntry {
  _id: string;
  loungeId: GuestbookLounge;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  birthMonth?: number;
  specialDates?: GuestbookSpecialDate[];
  photo?: GuestbookPhoto;
  createdAt: string;
  updatedAt?: string;
}

export interface GuestbookListParams {
  page?: number;
  limit?: number;
  search?: string;
  loungeId?: string;
}

export interface GuestbookSummaryItem {
  loungeId: string;
  loungeName: string;
  entryCount: number;
}
