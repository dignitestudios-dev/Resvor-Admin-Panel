'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans, getPlanById, updatePlan } from '@/lib/api/plans.api';
import type {
  Plan,
  PlanType,
  PlansFilterParams,
  SubscriptionPlanUpdatePayload,
  VenueMembershipPlanUpdatePayload,
  PlanUpdateResponse,
} from '@/types/plan';

export const PLAN_KEYS = {
  all: ['plans'] as const,
  lists: () => [...PLAN_KEYS.all, 'list'] as const,
  list: (params?: PlansFilterParams) => [...PLAN_KEYS.lists(), params] as const,
  details: () => [...PLAN_KEYS.all, 'detail'] as const,
  detail: (type?: PlanType, id?: string) => [...PLAN_KEYS.details(), type, id] as const,
};

export function usePlans(params?: PlansFilterParams) {
  return useQuery<Plan[]>({
    queryKey: PLAN_KEYS.list(params),
    queryFn: () => getPlans(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePlan(type?: PlanType, id?: string, options?: { enabled?: boolean }) {
  const isEnabled = Boolean(type && id) && (options?.enabled ?? true);

  return useQuery<Plan>({
    queryKey: PLAN_KEYS.detail(type, id),
    queryFn: () => {
      if (!type || !id) {
        throw new Error('Type and ID are required to fetch a plan.');
      }
      return getPlanById(type, id);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation<
    PlanUpdateResponse,
    unknown,
    {
      type: PlanType;
      id: string;
      payload: SubscriptionPlanUpdatePayload | VenueMembershipPlanUpdatePayload;
    }
  >({
    mutationFn: ({ type, id, payload }) => updatePlan(type, id, payload),
    onSuccess: (result, variables) => {
      // Invalidate the plans list to ensure fresh data
      queryClient.invalidateQueries({ queryKey: PLAN_KEYS.lists() });

      // Update detail cache immediately with fresh updated plan
      if (result.data) {
        queryClient.setQueryData(
          PLAN_KEYS.detail(variables.type, variables.id),
          result.data
        );
      }
    },
  });
}
