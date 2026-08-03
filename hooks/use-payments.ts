'use client';

import { useQuery } from '@tanstack/react-query';
import { getPayments, getPaymentById, getPaymentAnalytics } from '@/lib/api/payments.api';
import type { PaymentsListParams } from '@/types/payment';

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_KEYS.all, 'list'] as const,
  list: (params?: PaymentsListParams) => [...PAYMENT_KEYS.lists(), params] as const,
  details: () => [...PAYMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_KEYS.details(), id] as const,
  analytics: (interval: 'daily' | 'monthly') => [...PAYMENT_KEYS.all, 'analytics', interval] as const,
};

export function usePayments(params?: PaymentsListParams) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn: () => getPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => getPaymentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePaymentAnalytics(interval: 'daily' | 'monthly') {
  return useQuery({
    queryKey: PAYMENT_KEYS.analytics(interval),
    queryFn: () => getPaymentAnalytics(interval),
    staleTime: 1000 * 60 * 10,
  });
}
