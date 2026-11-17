import { API } from './axios';
import type { NormalizedListResponse, ApiResponse } from '@/types/common';
import type {
  GuestbookEntry,
  GuestbookListParams,
  GuestbookSummaryItem,
} from '@/types/guestbook';

interface GuestbookApiResponse {
  data: GuestbookEntry[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
}

export const getGuestbookEntries = async (
  params?: GuestbookListParams
): Promise<NormalizedListResponse<GuestbookEntry>> => {
  const response = await API.get<GuestbookApiResponse>('/admin/guestbook', {
    params,
  });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getGuestbookSummary = async (): Promise<GuestbookSummaryItem[]> => {
  const response = await API.get<{ data: GuestbookSummaryItem[]; message: string }>(
    '/admin/guestbook/summary'
  );
  return response.data.data ?? [];
};

export const getGuestbookEntryById = async (
  id: string
): Promise<GuestbookEntry> => {
  const response = await API.get<{ data: GuestbookEntry; message: string }>(
    `/admin/guestbook/${id}`
  );
  return response.data.data;
};

export const deleteGuestbookEntry = async (
  id: string
): Promise<{ message: string }> => {
  const response = await API.delete<{ message: string }>(
    `/admin/guestbook/${id}`
  );
  return response.data;
};

