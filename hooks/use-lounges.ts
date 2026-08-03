'use client';

import { useQuery } from '@tanstack/react-query';
import { getLounges, getLoungeById } from '@/lib/api/lounges.api';
import type { LoungesListParams } from '@/types/lounge';

export const LOUNGE_KEYS = {
  all: ['lounges'] as const,
  list: (params?: LoungesListParams) => ['lounges', 'list', params] as const,
  detail: (id: string) => ['lounges', 'detail', id] as const,
};

export function useLounges(params?: LoungesListParams) {
  return useQuery({
    queryKey: LOUNGE_KEYS.list(params),
    queryFn: () => getLounges(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLounge(id: string) {
  return useQuery({
    queryKey: LOUNGE_KEYS.detail(id),
    queryFn: () => getLoungeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
