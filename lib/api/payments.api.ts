import { API } from './axios';
import type { ListApiResponse, NormalizedListResponse } from '@/types/common';
import type { ApiResponse } from '@/types/common';
import type { Payment, PaymentsListParams, PaymentAnalytics } from '@/types/payment';

export const getPayments = async (
  params?: PaymentsListParams
): Promise<NormalizedListResponse<Payment>> => {
  // Real response: { success, message, data: Payment[], pagination: {...} }
  const response = await API.get<ListApiResponse<Payment>>('/admin/payments', { params });
  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  // Real response: { success, message, data: Payment }
  const response = await API.get<ApiResponse<Payment>>(`/admin/payments/${id}`);
  return response.data.data;
};

export const exportPaymentsCsv = async (): Promise<string> => {
  const response = await API.get('/admin/payments/export', {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/csv' });
  return URL.createObjectURL(blob);
};

export const getPaymentAnalytics = async (
  interval: 'daily' | 'monthly'
): Promise<PaymentAnalytics> => {
  const response = await API.get<ApiResponse<PaymentAnalytics>>('/admin/payments/analytics', {
    params: { interval },
  });
  return response.data.data;
};
