'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import {
  Layers,
  Crown,
  Edit3,
  Check,
  Users,
  Building2,
} from 'lucide-react';
import type { Plan, SubscriptionPlan, VenueMembershipPlan } from '@/types/plan';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
}

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  const isSubscription = plan.planType === 'subscription';
  const subPlan = isSubscription ? (plan as SubscriptionPlan) : null;
  const venuePlan = !isSubscription ? (plan as VenueMembershipPlan) : null;

  // Format billing duration or interval
  const billingInfo = isSubscription
    ? `${subPlan?.durationDays ?? 30} days`
    : `Billed ${venuePlan?.billingInterval ?? 'monthly'}`;

  // Applicable roles/interfaces
  const rolesList = isSubscription
    ? subPlan?.allowedRoles || plan.interfaces || ['user']
    : plan.interfaces || ['user'];

  return (
    <Card
      className={`relative overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md border ${
        isSubscription
          ? 'border-blue-200/60 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-700'
          : 'border-amber-200/60 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700'
      }`}
    >
      {/* Top Banner Accent Line */}
      <div
        className={`h-1.5 w-full ${
          isSubscription
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
            : 'bg-gradient-to-r from-amber-500 to-yellow-600'
        }`}
      />

      <CardHeader className="p-5 pb-3 space-y-3">
        {/* Header row: Plan Type Badge & Status */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-[11px] font-semibold gap-1 py-0.5 px-2.5 ${
              isSubscription
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            {isSubscription ? (
              <>
                <Layers className="h-3 w-3 shrink-0" /> Subscription Plan
              </>
            ) : (
              <>
                <Crown className="h-3 w-3 shrink-0" /> Venue Membership
              </>
            )}
          </Badge>

          <StatusBadge status={plan.isActive ? 'active' : 'inactive'} />
        </div>

        {/* Plan Title & Key */}
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">{plan.label}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              key: {plan.key}
            </span>
            {plan.sortOrder !== undefined && (
              <span className="text-[11px] text-muted-foreground">Order: {plan.sortOrder}</span>
            )}
          </div>
        </div>

        {/* Pricing Banner */}
        <div className="pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {plan.currency?.toUpperCase()} {Number(plan.displayPrice).toFixed(2)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">/ {billingInfo}</span>
          </div>
          {isSubscription && subPlan?.trialDays ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Includes {subPlan.trialDays} days free trial
            </p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 pb-4 space-y-4 flex-1">
        {/* Roles / Audience */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <Users className="h-3 w-3" /> Target:
          </span>
          {rolesList.map((role) => (
            <span
              key={role}
              className="text-[11px] bg-secondary text-secondary-foreground font-medium px-2 py-0.5 rounded capitalize flex items-center gap-1"
            >
              {role === 'lounge_manager' ? (
                <>
                  <Building2 className="h-3 w-3" /> Lounge Manager
                </>
              ) : (
                role
              )}
            </span>
          ))}
        </div>

        {/* Plan Content: Features list or Description */}
        <div className="border-t pt-3">
          {isSubscription && subPlan?.features ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Features ({subPlan.features.length})
              </span>
              <ul className="space-y-1.5 text-xs text-foreground/85">
                {subPlan.features.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
                {subPlan.features.length > 5 && (
                  <li className="text-[11px] text-muted-foreground pl-5.5 font-medium">
                    +{subPlan.features.length - 5} more features
                  </li>
                )}
              </ul>
            </div>
          ) : venuePlan?.description ? (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Description & Benefits
              </span>
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4">
                {venuePlan.description}
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={() => onEdit(plan)}
          variant="outline"
          size="sm"
          className="w-full gap-2 font-medium hover:bg-muted transition-colors cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
