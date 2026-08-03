'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUserById,
  suspendUser,
  activateUser,
} from '@/lib/api/users.api';
import type { UsersListParams } from '@/types/user';
import { toast } from 'sonner';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (params?: UsersListParams) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: (data) => {
      toast.success(data.message || 'User suspended successfully');
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Something went wrong.';
      toast.error(msg);
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: (data) => {
      toast.success(data.message || 'User activated successfully');
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Something went wrong.';
      toast.error(msg);
    },
  });
}
