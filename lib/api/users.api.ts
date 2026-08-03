import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse, ApiResponse } from '@/types/common';
import type { User, UserDetail, UsersListParams } from '@/types/user';

export const getUsers = async (
  params?: UsersListParams
): Promise<NormalizedListResponse<User>> => {
  // Real response: { success, message, data: User[], pagination: {...} }
  const response = await API.get<ListApiResponse<User>>('/admin/users', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getUserById = async (id: string): Promise<UserDetail> => {
  const response = await API.get<ApiResponse<{ user: UserDetail }>>(`/admin/users/${id}`);
  return response.data.data.user;
};

export const suspendUser = async (id: string): Promise<ApiResponse<unknown>> => {
  const response = await API.patch<ApiResponse<unknown>>(`/admin/users/${id}/suspend`);
  return response.data;
};

export const activateUser = async (id: string): Promise<ApiResponse<unknown>> => {
  const response = await API.patch<ApiResponse<unknown>>(`/admin/users/${id}/activate`);
  return response.data;
};
