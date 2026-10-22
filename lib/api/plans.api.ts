import { API } from './axios';
import type { ApiResponse } from '@/types/common';
import type {
  Plan,
  PlanType,
  PlansFilterParams,
  SubscriptionPlanUpdatePayload,
  VenueMembershipPlanUpdatePayload,
  PlanUpdateResponse,
  PriceMigrationSummary,
} from '@/types/plan';

/**
 * Fetch all plans with optional query filters.
 * GET /admin/plans?type=...&role=...&isActive=...
 */
export const getPlans = async (params?: PlansFilterParams): Promise<Plan[]> => {
  const queryParams: Record<string, string | boolean> = {};

  if (params?.type) {
    queryParams.type = params.type;
  }
  if (params?.role) {
    queryParams.role = params.role;
  }
  if (typeof params?.isActive === 'boolean') {
    queryParams.isActive = params.isActive;
  }

  const response = await API.get<ApiResponse<Plan[]> | Plan[]>('/admin/plans', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  // Handle both standard Resvor ApiResponse shape: { success: true, message, data: [...] }
  // and direct array format if returned directly
  if (Array.isArray(response.data)) {
    return response.data;
  }

  const data = (response.data as ApiResponse<Plan[]>)?.data;
  if (Array.isArray(data)) {
    return data;
  }

  // Fallback for wrapped items object if present
  if (data && Array.isArray((data as unknown as { items?: Plan[] }).items)) {
    return (data as unknown as { items: Plan[] }).items;
  }

  return [];
};

/**
 * Fetch a single plan by type and ID.
 * GET /admin/plans/:type/:id
 */
export const getPlanById = async (type: PlanType, id: string): Promise<Plan> => {
  const response = await API.get<ApiResponse<Plan>>(`/admin/plans/${type}/${id}`);
  return response.data.data;
};

/**
 * Update an existing plan.
 * PATCH /admin/plans/:type/:id
 * Only changed editable fields are sent in payload.
 * Timeout is extended for price migrations as subscriber batch migrations can take longer.
 */
export const updatePlan = async (
  type: PlanType,
  id: string,
  payload: SubscriptionPlanUpdatePayload | VenueMembershipPlanUpdatePayload
): Promise<PlanUpdateResponse> => {
  const isPriceUpdate = 'displayPrice' in payload && payload.displayPrice !== undefined;

  const response = await API.patch<
    PlanUpdateResponse & {
      data: Plan & { priceMigration?: PriceMigrationSummary };
    }
  >(`/admin/plans/${type}/${id}`, payload, {
    timeout: isPriceUpdate ? 60000 : 15000,
  });

  const responseData = response.data;
  // Look for priceMigration at root or inside data
  const priceMigration =
    responseData.priceMigration ||
    responseData.data?.priceMigration ||
    undefined;

  return {
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
    priceMigration,
  };
};
