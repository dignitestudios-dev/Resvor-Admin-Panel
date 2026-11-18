import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse, ApiResponse } from '@/types/common';
import type { Event, EventDetail, EventsListParams, ExportEventsParams } from '@/types/event';

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

export const exportEventsCsv = async (
  params?: ExportEventsParams
): Promise<Blob> => {
  const response = await API.get('/admin/events/export', {
    params,
    responseType: 'blob',
  });
  return new Blob([response.data], { type: 'text/csv' });
};
