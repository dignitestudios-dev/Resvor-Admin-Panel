import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse, ApiResponse } from '@/types/common';
import type { Event, EventDetail, EventsListParams } from '@/types/event';

export const getEvents = async (
  params?: EventsListParams
): Promise<NormalizedListResponse<Event>> => {
  // Real response: { success, message, data: Event[], pagination: {...} }
  const response = await API.get<ListApiResponse<Event>>('/admin/events', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getEventById = async (id: string): Promise<EventDetail> => {
  const response = await API.get<ApiResponse<EventDetail>>(`/admin/events/${id}`);
  return response.data.data;
};
