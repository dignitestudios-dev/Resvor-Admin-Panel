import { API } from './axios';
import type { LoginRequest, LoginResponse, MeResponse } from '@/types/auth';

const TOKEN_KEY = 'resvor_admin_token';

// Admin Login
export const adminLogin = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await API.post<LoginResponse>('/admin/auth/login', credentials);
  const { data } = response;

  if (data.success && data.data?.token) {
    localStorage.setItem(TOKEN_KEY, data.data.token);
  }

  return data;
};

// Get current admin session
export const getAdminMe = async (): Promise<MeResponse> => {
  const response = await API.get<MeResponse>('/admin/auth/me');
  return response.data;
};

// Logout — clear token locally (no dedicated admin logout endpoint documented)
export const adminLogout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Get stored token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};