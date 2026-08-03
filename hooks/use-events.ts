'use client';

import { useQuery } from '@tanstack/react-query';
import { getEvents, getEventById } from '@/lib/api/events.api';
import type { EventsListParams } from '@/types/event';

export const EVENT_KEYS = {
  all: ['events'] as const,
  list: (params?: EventsListParams) => ['events', 'list', params] as const,
  detail: (id: string) => ['events', 'detail', id] as const,
};

export function useEvents(params?: EventsListParams) {
  return useQuery({
    queryKey: EVENT_KEYS.list(params),
    queryFn: () => getEvents(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
