import { useQuery } from '@tanstack/react-query';
import { getBookings, getBookingById } from '@/lib/api/bookings.api';
import type { BookingsListParams } from '@/types/booking';

export const BOOKING_KEYS = {
  all: ['bookings'] as const,
  lists: () => [...BOOKING_KEYS.all, 'list'] as const,
  list: (params: BookingsListParams) => [...BOOKING_KEYS.lists(), params] as const,
  details: () => [...BOOKING_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BOOKING_KEYS.details(), id] as const,
};

export function useBookings(params: BookingsListParams) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(params),
    queryFn: () => getBookings(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
