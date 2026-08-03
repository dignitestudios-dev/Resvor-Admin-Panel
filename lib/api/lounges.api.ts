import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse } from '@/types/common';
import type { Lounge, LoungeDetail, LoungesListParams } from '@/types/lounge';
import type { ApiResponse } from '@/types/common';

export const getLounges = async (
  params?: LoungesListParams
): Promise<NormalizedListResponse<Lounge>> => {
  // Real response: { success, message, data: Lounge[], pagination: {...} }
  const response = await API.get<ListApiResponse<Lounge>>('/admin/lounges', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getLoungeById = async (id: string): Promise<LoungeDetail> => {
  const response = await API.get<ApiResponse<{ lounge: LoungeDetail }>>(`/admin/lounges/${id}`);
  return response.data.data.lounge;
};
