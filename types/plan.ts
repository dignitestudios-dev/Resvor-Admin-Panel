// TypeScript interfaces and types for Resvor Plan Management

export type PlanType = 'subscription' | 'venue_membership';

export type PlanRole = 'user' | 'lounge_manager';

export interface SubscriptionLimitations {
  campaignsPerBillingPeriod?: number | null;
  recipientsPerCampaign?: number | null;
  campaignChannels?: string[];
  [key: string]: unknown;
}

export interface BasePlan {
  _id: string;
  key: string;
  label: string;
  displayPrice: number;
  currency: string;
  interfaces?: string[];
  isActive: boolean;
  sortOrder: number;
  planType: PlanType;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan extends BasePlan {
  planType: 'subscription';
  durationDays: number;
  features: string[];
  allowedRoles: string[];
  trialDays?: number;
  limitations?: SubscriptionLimitations;
}

export interface VenueMembershipPlan extends BasePlan {
  planType: 'venue_membership';
  description: string;
  billingInterval: string;
  isPriceProvisional?: boolean;
}

export type Plan = SubscriptionPlan | VenueMembershipPlan;

export interface PriceMigrationSummary {
  matched: number;
  migrated: number;
  alreadyMigrated: number;
  noLongerBillable: number;
  failed: number;
  oldPriceArchived: boolean;
}

export interface PlanUpdateResponse {
  success: boolean;
  message: string;
  data: Plan;
  priceMigration?: PriceMigrationSummary;
}

export interface PlansFilterParams {
  type?: PlanType;
  role?: PlanRole;
  isActive?: boolean;
  search?: string;
}

// Editable payloads - ONLY allowed fields
export interface SubscriptionPlanUpdatePayload {
  label?: string;
  features?: string[];
  displayPrice?: number;
}

export interface VenueMembershipPlanUpdatePayload {
  label?: string;
  description?: string;
  displayPrice?: number;
}

export type PlanUpdatePayload =
  | SubscriptionPlanUpdatePayload
  | VenueMembershipPlanUpdatePayload;

export interface ApiValidationErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponseData {
  success: boolean;
  message: string;
  error?: ApiValidationErrorDetail[];
}
