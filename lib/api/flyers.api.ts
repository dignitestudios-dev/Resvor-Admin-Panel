import { API } from './axios';
import type { ApiResponse, NormalizedListResponse } from '@/types/common';
import type { Flyer, FlyerAnalytics, FlyersListParams } from '@/types/flyer';

interface BackendFlyersResponse {
  message: string;
  data: Flyer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getFlyers = async (
  params?: FlyersListParams
): Promise<NormalizedListResponse<Flyer>> => {
  const response = await API.get<BackendFlyersResponse>('/admin/flyers', { params });
  return {
    items: response.data.data ?? [],
    pagination: {
      currentPage: response.data.pagination.page,
      itemsPerPage: response.data.pagination.limit,
      totalItems: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
    },
  };
};

export const getFlyerById = async (id: string): Promise<Flyer> => {
  const response = await API.get<ApiResponse<Flyer>>(`/admin/flyers/${id}`);
  return response.data.data;
};

export const getFlyerAnalytics = async (): Promise<FlyerAnalytics> => {
  const response = await API.get<ApiResponse<FlyerAnalytics>>('/admin/flyers/analytics');
  return response.data.data;
};
