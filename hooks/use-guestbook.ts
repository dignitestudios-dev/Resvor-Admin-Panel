'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGuestbookEntries,
  getGuestbookSummary,
  getGuestbookEntryById,
  deleteGuestbookEntry,
} from '@/lib/api/guestbook.api';
import type { GuestbookListParams } from '@/types/guestbook';

export const GUESTBOOK_KEYS = {
  all: ['guestbook'] as const,
  list: (params?: GuestbookListParams) => ['guestbook', 'list', params] as const,
  summary: () => ['guestbook', 'summary'] as const,
  detail: (id: string) => ['guestbook', 'detail', id] as const,
};

export function useGuestbookEntries(params?: GuestbookListParams) {
  return useQuery({
    queryKey: GUESTBOOK_KEYS.list(params),
    queryFn: () => getGuestbookEntries(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useGuestbookSummary() {
  return useQuery({
    queryKey: GUESTBOOK_KEYS.summary(),
    queryFn: () => getGuestbookSummary(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGuestbookEntry(id: string) {
  return useQuery({
    queryKey: GUESTBOOK_KEYS.detail(id),
    queryFn: () => getGuestbookEntryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteGuestbookEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuestbookEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.all });
    },
  });
}

