import type {
  Plan,
  SubscriptionPlan,
  VenueMembershipPlan,
  SubscriptionPlanUpdatePayload,
  VenueMembershipPlanUpdatePayload,
  ApiErrorResponseData,
  PlansFilterParams,
} from '@/types/plan';

/**
 * Validates a display price.
 * Must be a number greater than zero with at most two decimal places.
 */
export function validateDisplayPrice(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return 'Price is required and must be greater than zero.';
  }

  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return 'Price must be a valid number.';
  }

  if (num <= 0) {
    return 'Price must be greater than zero.';
  }

  // Check decimal places (at most 2 decimals)
  const str = String(value).trim();
  // Match standard decimal format with at most 2 digits after decimal
  if (!/^\d+(\.\d{1,2})?$/.test(str) && Math.round(num * 100) !== num * 100) {
    return 'Price supports at most two decimal places.';
  }

  return null;
}

/**
 * Validates a plan label.
 * Required and cannot be empty.
 */
export function validateLabel(label: unknown): string | null {
  if (typeof label !== 'string' || label.trim().length === 0) {
    return 'Plan label is required and cannot be empty.';
  }
  return null;
}

/**
 * Validates subscription features list.
 * Must contain between 1 and 25 non-empty strings.
 */
export function validateSubscriptionFeatures(features: unknown): string | null {
  if (!Array.isArray(features)) {
    return 'Features must be a list.';
  }

  if (features.length === 0) {
    return 'Subscription must have at least 1 feature.';
  }

  // Check if any original items were empty
  const hasEmpty = features.some((f) => typeof f !== 'string' || f.trim().length === 0);
  if (hasEmpty) {
    return 'All feature items must be non-empty.';
  }

  if (features.length > 25) {
    return 'Subscription cannot have more than 25 features.';
  }

  return null;
}

/**
 * Validates venue-membership description.
 * Cannot be empty.
 */
export function validateVenueDescription(description: unknown): string | null {
  if (typeof description !== 'string' || description.trim().length === 0) {
    return 'Description is required and cannot be empty.';
  }
  return null;
}

/**
 * Cleanly compares arrays of strings for equality.
 */
function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].trim() !== b[i].trim()) return false;
  }
  return true;
}

/**
 * Computes delta for subscription plan update.
 * Returns only changed editable fields: label, features, displayPrice.
 * Protected fields are strictly never included.
 */
export function computeSubscriptionDelta(
  original: SubscriptionPlan,
  current: { label: string; features: string[]; displayPrice: number | string }
): SubscriptionPlanUpdatePayload | null {
  const payload: SubscriptionPlanUpdatePayload = {};
  let hasChanges = false;

  const currentLabel = current.label.trim();
  if (currentLabel !== original.label.trim()) {
    payload.label = currentLabel;
    hasChanges = true;
  }

  const currentFeatures = current.features.map((f) => f.trim()).filter((f) => f.length > 0);
  if (!areStringArraysEqual(currentFeatures, original.features)) {
    payload.features = currentFeatures;
    hasChanges = true;
  }

  const currentPrice = Number(Number(current.displayPrice).toFixed(2));
  const originalPrice = Number(Number(original.displayPrice).toFixed(2));
  if (currentPrice !== originalPrice) {
    payload.displayPrice = currentPrice;
    hasChanges = true;
  }

  return hasChanges ? payload : null;
}

/**
 * Computes delta for venue-membership plan update.
 * Returns only changed editable fields: label, description, displayPrice.
 * Protected fields are strictly never included.
 */
export function computeVenueDelta(
  original: VenueMembershipPlan,
  current: { label: string; description: string; displayPrice: number | string }
): VenueMembershipPlanUpdatePayload | null {
  const payload: VenueMembershipPlanUpdatePayload = {};
  let hasChanges = false;

  const currentLabel = current.label.trim();
  if (currentLabel !== original.label.trim()) {
    payload.label = currentLabel;
    hasChanges = true;
  }

  const currentDesc = current.description.trim();
  if (currentDesc !== (original.description || '').trim()) {
    payload.description = currentDesc;
    hasChanges = true;
  }

  const currentPrice = Number(Number(current.displayPrice).toFixed(2));
  const originalPrice = Number(Number(original.displayPrice).toFixed(2));
  if (currentPrice !== originalPrice) {
    payload.displayPrice = currentPrice;
    hasChanges = true;
  }

  return hasChanges ? payload : null;
}

/**
 * Calculates price change details for confirmation dialog.
 */
export function calculatePriceChange(
  oldPrice: number,
  newPrice: number,
  currency = 'USD'
): {
  oldPrice: number;
  newPrice: number;
  diff: number;
  percentChange: number;
  isIncrease: boolean;
  isDecrease: boolean;
  formattedDiff: string;
} {
  const diff = Number((newPrice - oldPrice).toFixed(2));
  const percentChange = oldPrice > 0 ? Number(((diff / oldPrice) * 100).toFixed(1)) : 0;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;

  const sign = isIncrease ? '+' : isDecrease ? '-' : '';
  const absDiff = Math.abs(diff).toFixed(2);
  const formattedPercent = `${sign}${Math.abs(percentChange).toFixed(1)}%`;
  const formattedDiff = `${sign}${currency.toUpperCase()} ${absDiff} (${formattedPercent})`;

  return {
    oldPrice,
    newPrice,
    diff,
    percentChange,
    isIncrease,
    isDecrease,
    formattedDiff,
  };
}

/**
 * Parses field-level validation errors from Resvor API response.
 * Handles shapes like:
 * {
 *   success: false,
 *   message: "Error message",
 *   error: [{ path: "body.displayPrice", message: "Validation message" }]
 * }
 */
export function parseApiValidationErrors(
  error: unknown
): {
  fieldErrors: Record<string, string>;
  generalMessage: string;
  isHttp503: boolean;
} {
  const fieldErrors: Record<string, string> = {};
  let generalMessage = 'An unexpected error occurred while saving the plan.';
  let isHttp503 = false;

  if (!error || typeof error !== 'object') {
    return { fieldErrors, generalMessage, isHttp503 };
  }

  const axiosError = error as {
    response?: {
      status?: number;
      data?: ApiErrorResponseData | { message?: string; error?: unknown };
    };
    message?: string;
  };

  if (axiosError.response?.status === 503) {
    isHttp503 = true;
    generalMessage =
      (axiosError.response.data as { message?: string })?.message ||
      'Some subscriptions could not be migrated at this time. Please retry the price update.';
  } else if (axiosError.response?.data?.message) {
    generalMessage = axiosError.response.data.message;
  } else if (axiosError.message) {
    generalMessage = axiosError.message;
  }

  const errorData = axiosError.response?.data as ApiErrorResponseData | undefined;
  if (Array.isArray(errorData?.error)) {
    for (const item of errorData.error) {
      if (item && typeof item.path === 'string' && typeof item.message === 'string') {
        // Strip prefixes like "body." or "body.features[0]" -> "features"
        const cleanPath = item.path.replace(/^body\./, '').split('[')[0];
        fieldErrors[cleanPath] = item.message;
      }
    }
  }

  return { fieldErrors, generalMessage, isHttp503 };
}

/**
 * Filter plans locally if needed or when full list is in memory.
 */
export function filterPlans(plans: Plan[], filters: PlansFilterParams): Plan[] {
  return plans.filter((plan) => {
    // Type filter
    if (filters.type && plan.planType !== filters.type) {
      return false;
    }

    // Active status filter
    if (typeof filters.isActive === 'boolean' && plan.isActive !== filters.isActive) {
      return false;
    }

    // Role / interface filter
    if (filters.role) {
      const targetRole = filters.role.toLowerCase();
      const planInterfaces = (plan.interfaces || []).map((i) => i.toLowerCase());
      const allowedRoles =
        plan.planType === 'subscription'
          ? (plan.allowedRoles || []).map((r) => r.toLowerCase())
          : [];

      const matchesInterface = planInterfaces.includes(targetRole);
      const matchesAllowedRoles = allowedRoles.includes(targetRole);

      if (!matchesInterface && !matchesAllowedRoles) {
        return false;
      }
    }

    // Search filter
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      const labelMatch = plan.label.toLowerCase().includes(q);
      const keyMatch = plan.key.toLowerCase().includes(q);
      const descMatch =
        plan.planType === 'venue_membership'
          ? (plan.description || '').toLowerCase().includes(q)
          : false;
      const featuresMatch =
        plan.planType === 'subscription'
          ? plan.features.some((f) => f.toLowerCase().includes(q))
          : false;

      if (!labelMatch && !keyMatch && !descMatch && !featuresMatch) {
        return false;
      }
    }

    return true;
  });
}
