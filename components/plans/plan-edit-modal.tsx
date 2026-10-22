'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/status-badge';
import { PlanPriceConfirmDialog } from '@/components/plans/plan-price-confirm-dialog';
import {
  validateDisplayPrice,
  validateLabel,
  validateSubscriptionFeatures,
  validateVenueDescription,
  computeSubscriptionDelta,
  computeVenueDelta,
  parseApiValidationErrors,
} from '@/lib/plan-utils';
import { usePlan, useUpdatePlan } from '@/hooks/use-plans';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Lock,
  Layers,
  Building2,
} from 'lucide-react';
import type {
  Plan,
  PlanType,
  SubscriptionPlan,
  VenueMembershipPlan,
  PriceMigrationSummary,
  SubscriptionPlanUpdatePayload,
  VenueMembershipPlanUpdatePayload,
} from '@/types/plan';

interface PlanEditModalProps {
  planType: PlanType | null;
  planId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: { plan: Plan; migration?: PriceMigrationSummary }) => void;
}

export function PlanEditModal({
  planType,
  planId,
  open,
  onOpenChange,
  onSuccess,
}: PlanEditModalProps) {
  // Fetch latest plan using GET /admin/plans/:type/:id before editing
  const {
    data: latestPlan,
    isLoading: isLoadingLatest,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = usePlan(planType ?? undefined, planId ?? undefined, {
    enabled: open && Boolean(planType && planId),
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden"
        aria-describedby="plan-edit-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            {latestPlan?.planType === 'subscription' ? (
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Layers className="h-5 w-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Building2 className="h-5 w-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Edit {latestPlan?.label || 'Plan'}
              </DialogTitle>
              <DialogDescription id="plan-edit-description" className="text-xs text-muted-foreground">
                Update plan information. Only editable fields (label, display price, and{' '}
                {latestPlan?.planType === 'subscription' ? 'features' : 'description'}) can be modified.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingLatest ? (
          <div className="space-y-4 p-8 flex-1">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Fetching latest plan details…</span>
            </div>
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : isFetchError || !latestPlan ? (
          <div className="p-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-semibold">Failed to fetch latest plan details</p>
            <p className="text-xs text-muted-foreground">
              {(fetchError as { message?: string })?.message || 'Unable to retrieve plan from server.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <PlanEditForm
            key={latestPlan._id}
            plan={latestPlan}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PlanEditFormProps {
  plan: Plan;
  onCancel: () => void;
  onClose: () => void;
  onSuccess: (result: { plan: Plan; migration?: PriceMigrationSummary }) => void;
}

function PlanEditForm({ plan, onCancel, onClose, onSuccess }: PlanEditFormProps) {
  const updateMutation = useUpdatePlan();

  // Initial form values from latest plan
  const [label, setLabel] = useState(plan.label || '');
  const [displayPrice, setDisplayPrice] = useState(String(plan.displayPrice ?? ''));
  const [description, setDescription] = useState(
    plan.planType === 'venue_membership' ? (plan as VenueMembershipPlan).description || '' : ''
  );
  const [features, setFeatures] = useState<string[]>(
    plan.planType === 'subscription' && (plan as SubscriptionPlan).features
      ? [...(plan as SubscriptionPlan).features]
      : []
  );

  // Validation & Error states
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isHttp503, setIsHttp503] = useState(false);

  // Price confirmation dialog state
  const [showPriceConfirm, setShowPriceConfirm] = useState(false);

  // Handle adding a feature
  const handleAddFeature = () => {
    if (features.length >= 25) {
      toast.error('Subscriptions support at most 25 features.');
      return;
    }
    setFeatures((prev) => [...prev, '']);
    setClientErrors((prev) => {
      const copy = { ...prev };
      delete copy.features;
      return copy;
    });
  };

  // Handle removing a feature
  const handleRemoveFeature = (index: number) => {
    if (features.length <= 1) {
      toast.error('Subscription must contain at least 1 feature.');
      return;
    }
    setFeatures((prev) => prev.filter((_, idx) => idx !== index));
    setClientErrors((prev) => {
      const copy = { ...prev };
      delete copy.features;
      return copy;
    });
  };

  // Handle moving a feature up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFeatures((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Handle moving a feature down
  const handleMoveDown = (index: number) => {
    if (index === features.length - 1) return;
    setFeatures((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Handle editing a feature text
  const handleFeatureChange = (index: number, value: string) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    setClientErrors((prev) => {
      const copy = { ...prev };
      delete copy.features;
      return copy;
    });
    setApiErrors((prev) => {
      const copy = { ...prev };
      delete copy.features;
      return copy;
    });
  };

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const labelErr = validateLabel(label);
    if (labelErr) errors.label = labelErr;

    const priceErr = validateDisplayPrice(displayPrice);
    if (priceErr) errors.displayPrice = priceErr;

    if (plan.planType === 'subscription') {
      const featErr = validateSubscriptionFeatures(features);
      if (featErr) errors.features = featErr;
    } else {
      const descErr = validateVenueDescription(description);
      if (descErr) errors.description = descErr;
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate delta of changed editable fields
  const getPayload = (): SubscriptionPlanUpdatePayload | VenueMembershipPlanUpdatePayload | null => {
    if (plan.planType === 'subscription') {
      return computeSubscriptionDelta(plan as SubscriptionPlan, {
        label,
        features,
        displayPrice,
      });
    }

    return computeVenueDelta(plan as VenueMembershipPlan, {
      label,
      description,
      displayPrice,
    });
  };

  // Primary submit handler triggered by user clicking Save Changes
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    const payload = getPayload();
    if (!payload || Object.keys(payload).length === 0) {
      toast.info('No changes were made to the plan.');
      return;
    }

    // Check if price changed
    if (payload.displayPrice !== undefined) {
      setShowPriceConfirm(true);
    } else {
      executeSubmission(payload);
    }
  };

  // Execute the update API call
  const executeSubmission = async (
    payload: SubscriptionPlanUpdatePayload | VenueMembershipPlanUpdatePayload
  ) => {
    setApiErrors({});
    setGeneralError(null);
    setIsHttp503(false);

    try {
      const result = await updateMutation.mutateAsync({
        type: plan.planType,
        id: plan._id,
        payload,
      });

      setShowPriceConfirm(false);
      onClose();

      if (payload.displayPrice !== undefined) {
        toast.success(result.message || 'Plan and subscribers updated successfully.');
      } else {
        toast.success(result.message || 'Plan updated successfully.');
      }

      onSuccess({
        plan: result.data,
        migration: result.priceMigration,
      });
    } catch (err: unknown) {
      const parsed = parseApiValidationErrors(err);
      setApiErrors(parsed.fieldErrors);
      setGeneralError(parsed.generalMessage);
      setIsHttp503(parsed.isHttp503);

      if (parsed.isHttp503) {
        setShowPriceConfirm(false);
        toast.error('Subscriber migration incomplete. Please retry the price update.');
      } else {
        setShowPriceConfirm(false);
        toast.error(parsed.generalMessage);
      }
    }
  };

  // Retry action for HTTP 503
  const handleRetryPriceUpdate = () => {
    const payload = getPayload();
    if (payload) {
      executeSubmission(payload);
    }
  };

  const payload = getPayload();
  const hasChanges = Boolean(payload && Object.keys(payload).length > 0);
  const isPriceUpdate = payload?.displayPrice !== undefined;
  const isSubmitting = updateMutation.isPending;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <form id="plan-edit-form" onSubmit={handleSaveClick} className="space-y-5">
          {/* HTTP 503 Partial Migration Alert */}
          {isHttp503 && (
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>Partial Price Migration (HTTP 503)</span>
              </div>
              <p className="text-xs leading-relaxed">
                {generalError ||
                  'Some subscriptions could not be migrated at this time. All form data has been preserved. Retrying is safe because subscriptions already migrated will be skipped.'}
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isSubmitting}
                  onClick={handleRetryPriceUpdate}
                  className="text-xs font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Retrying…
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Retry price update
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* General Non-503 Error Banner */}
          {!isHttp503 && generalError && (
            <div className="p-3.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">{generalError}</div>
            </div>
          )}

          {/* Protected Plan Meta Banner */}
          <div className="bg-muted/30 border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5" /> Protected Metadata (Read-Only)
              </span>
              <StatusBadge status={plan.isActive ? 'active' : 'inactive'} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Key</span>
                <span className="font-mono font-medium">{plan.key}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Type</span>
                <span className="capitalize">{plan.planType.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Billing</span>
                <span>
                  {plan.planType === 'subscription'
                    ? `${(plan as SubscriptionPlan).durationDays} Days`
                    : (plan as VenueMembershipPlan).billingInterval}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Currency</span>
                <span className="uppercase font-semibold">{plan.currency}</span>
              </div>
            </div>
          </div>

          {/* Plan Label */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-label" className="text-xs font-semibold">
              Plan Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="plan-label"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setClientErrors((p) => ({ ...p, label: '' }));
                setApiErrors((p) => ({ ...p, label: '' }));
              }}
              placeholder="e.g. Gold Plus"
              disabled={isSubmitting}
              className={
                clientErrors.label || apiErrors.label ? 'border-destructive focus-visible:ring-destructive/30' : ''
              }
            />
            {(clientErrors.label || apiErrors.label) && (
              <p className="text-xs text-destructive font-medium">
                {clientErrors.label || apiErrors.label}
              </p>
            )}
          </div>

          {/* Display Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="plan-price" className="text-xs font-semibold">
                Display Price ({plan.currency.toUpperCase()}) <span className="text-destructive">*</span>
              </Label>
              {displayPrice !== String(plan.displayPrice) && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Price modified &bull; Will require confirmation
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                min="0.01"
                value={displayPrice}
                onChange={(e) => {
                  setDisplayPrice(e.target.value);
                  setClientErrors((p) => ({ ...p, displayPrice: '' }));
                  setApiErrors((p) => ({ ...p, displayPrice: '' }));
                }}
                placeholder="0.00"
                disabled={isSubmitting}
                className={
                  clientErrors.displayPrice || apiErrors.displayPrice
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : ''
                }
              />
            </div>
            {(clientErrors.displayPrice || apiErrors.displayPrice) && (
              <p className="text-xs text-destructive font-medium">
                {clientErrors.displayPrice || apiErrors.displayPrice}
              </p>
            )}
          </div>

          {/* Subscription Features List */}
          {plan.planType === 'subscription' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Features ({features.length}/25) <span className="text-destructive">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                  disabled={features.length >= 25 || isSubmitting}
                  className="h-7 text-xs px-2 gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Feature
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1.5 group">
                    <span className="text-[11px] text-muted-foreground w-5 text-right font-mono">
                      {index + 1}.
                    </span>
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      disabled={isSubmitting}
                      className="h-8 text-xs flex-1"
                    />
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || isSubmitting}
                        className="h-7 w-7 p-0"
                        title="Move up"
                        aria-label={`Move feature ${index + 1} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === features.length - 1 || isSubmitting}
                        className="h-7 w-7 p-0"
                        title="Move down"
                        aria-label={`Move feature ${index + 1} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        disabled={features.length <= 1 || isSubmitting}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Remove feature"
                        aria-label={`Remove feature ${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {(clientErrors.features || apiErrors.features) && (
                <p className="text-xs text-destructive font-medium">
                  {clientErrors.features || apiErrors.features}
                </p>
              )}
            </div>
          )}

          {/* Venue Membership Description */}
          {plan.planType === 'venue_membership' && (
            <div className="space-y-1.5">
              <Label htmlFor="venue-description" className="text-xs font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="venue-description"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setClientErrors((p) => ({ ...p, description: '' }));
                  setApiErrors((p) => ({ ...p, description: '' }));
                }}
                placeholder="Describe membership benefits at participating venues..."
                disabled={isSubmitting}
                className={
                  clientErrors.description || apiErrors.description
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : ''
                }
              />
              {(clientErrors.description || apiErrors.description) && (
                <p className="text-xs text-destructive font-medium">
                  {clientErrors.description || apiErrors.description}
                </p>
              )}
            </div>
          )}
        </form>
      </div>

      <DialogFooter className="px-6 py-4 border-t bg-muted/20">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="plan-edit-form"
          disabled={isSubmitting || !hasChanges}
          className={
            isPriceUpdate
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : ''
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPriceUpdate ? 'Updating pricing…' : 'Saving changes…'}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {isPriceUpdate ? 'Review & Update' : 'Save Changes'}
            </>
          )}
        </Button>
      </DialogFooter>

      {/* Price Change Confirmation Dialog */}
      <PlanPriceConfirmDialog
        open={showPriceConfirm}
        onOpenChange={setShowPriceConfirm}
        planLabel={plan.label}
        currency={plan.currency}
        oldPrice={plan.displayPrice}
        newPrice={Number(displayPrice) || plan.displayPrice}
        isSubmitting={isSubmitting}
        onConfirm={() => {
          const currentPayload = getPayload();
          if (currentPayload) {
            executeSubmission(currentPayload);
          }
        }}
        onCancel={() => setShowPriceConfirm(false)}
      />
    </>
  );
}
