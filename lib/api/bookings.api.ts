import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse, ApiResponse } from '@/types/common';
import type { Booking, BookingDetail, BookingsListParams } from '@/types/booking';

export const getBookings = async (
  params?: BookingsListParams
): Promise<NormalizedListResponse<Booking>> => {
  // Real response: { success, message, data: Booking[], pagination: {...} }
  const response = await API.get<ListApiResponse<Booking>>('/admin/bookings', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getBookingById = async (id: string): Promise<BookingDetail> => {
  const response = await API.get<ApiResponse<BookingDetail>>(`/admin/bookings/${id}`);
  return response.data.data;
};

export const exportBookingsCsv = async (): Promise<string> => {
  // Real response returns a CSV file
  const response = await API.get('/admin/bookings/export', {
    responseType: 'blob',
  });
  
  // Create object URL for the CSV file download
  const blob = new Blob([response.data], { type: 'text/csv' });
  return URL.createObjectURL(blob);
};
