'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBartenders,
  getBartenderById,
  suspendBartender,
  activateBartender,
} from '@/lib/api/bartenders.api';
import type { BartendersListParams } from '@/types/bartender';
import { toast } from 'sonner';

export const BARTENDER_KEYS = {
  all: ['bartenders'] as const,
  list: (params?: BartendersListParams) =>
    ['bartenders', 'list', params] as const,
  detail: (id: string) => ['bartenders', 'detail', id] as const,
};

export function useBartenders(params?: BartendersListParams) {
  return useQuery({
    queryKey: BARTENDER_KEYS.list(params),
    queryFn: () => getBartenders(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBartender(id: string) {
  return useQuery({
    queryKey: BARTENDER_KEYS.detail(id),
    queryFn: () => getBartenderById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSuspendBartender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suspendBartender(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Bartender suspended successfully');
      queryClient.invalidateQueries({ queryKey: BARTENDER_KEYS.all });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Something went wrong.';
      toast.error(msg);
    },
  });
}

export function useActivateBartender() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateBartender(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Bartender activated successfully');
      queryClient.invalidateQueries({ queryKey: BARTENDER_KEYS.all });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Something went wrong.';
      toast.error(msg);
    },
  });
}
