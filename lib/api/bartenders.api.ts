import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse, ApiResponse } from '@/types/common';
import type { Bartender, BartenderDetail, BartendersListParams } from '@/types/bartender';

export const getBartenders = async (
  params?: BartendersListParams
): Promise<NormalizedListResponse<Bartender>> => {
  // Real response: { success, message, data: Bartender[], pagination: {...} }
  const response = await API.get<ListApiResponse<Bartender>>('/admin/bartenders', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getBartenderById = async (id: string): Promise<BartenderDetail> => {
  const response = await API.get<ApiResponse<BartenderDetail>>(`/admin/bartenders/${id}`);
  return response.data.data;
};

export const suspendBartender = async (id: string): Promise<ApiResponse<unknown>> => {
  const response = await API.patch<ApiResponse<unknown>>(`/admin/bartenders/${id}/suspend`);
  return response.data;
};

export const activateBartender = async (id: string): Promise<ApiResponse<unknown>> => {
  const response = await API.patch<ApiResponse<unknown>>(`/admin/bartenders/${id}/activate`);
  return response.data;
};
