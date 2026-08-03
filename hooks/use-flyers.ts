import { useQuery } from '@tanstack/react-query';
import { getFlyers, getFlyerById, getFlyerAnalytics } from '@/lib/api/flyers.api';
import type { FlyersListParams } from '@/types/flyer';

export const FLYER_KEYS = {
  all: ['flyers'] as const,
  lists: () => [...FLYER_KEYS.all, 'list'] as const,
  list: (params: FlyersListParams) => [...FLYER_KEYS.lists(), params] as const,
  details: () => [...FLYER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FLYER_KEYS.details(), id] as const,
  analytics: () => [...FLYER_KEYS.all, 'analytics'] as const,
};

export function useFlyers(params: FlyersListParams) {
  return useQuery({
    queryKey: FLYER_KEYS.list(params),
    queryFn: () => getFlyers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useFlyer(id: string) {
  return useQuery({
    queryKey: FLYER_KEYS.detail(id),
    queryFn: () => getFlyerById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFlyerAnalytics() {
  return useQuery({
    queryKey: FLYER_KEYS.analytics(),
    queryFn: getFlyerAnalytics,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
