'use client';

import React, { useState, useMemo } from 'react';
import { usePlans } from '@/hooks/use-plans';
import { PlanCard } from '@/components/plans/plan-card';
import { PlanEditModal } from '@/components/plans/plan-edit-modal';
import { PlanMigrationSummaryDialog } from '@/components/plans/plan-migration-summary-dialog';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Layers,
  Crown,
  Search,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { filterPlans } from '@/lib/plan-utils';
import type {
  Plan,
  PlanType,
  PlanRole,
  PlansFilterParams,
  PriceMigrationSummary,
  SubscriptionPlan,
  VenueMembershipPlan,
} from '@/types/plan';

export default function PlansPage() {
  // Query Filters state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [editingPlanType, setEditingPlanType] = useState<PlanType | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Price migration summary modal state
  const [migrationSummary, setMigrationSummary] = useState<PriceMigrationSummary | null>(null);
  const [migrationPlanLabel, setMigrationPlanLabel] = useState<string>('');
  const [isMigrationDialogOpen, setIsMigrationDialogOpen] = useState(false);

  // Build API query params
  const apiParams: PlansFilterParams = useMemo(() => {
    const params: PlansFilterParams = {};
    if (typeFilter !== 'all') {
      params.type = typeFilter as PlanType;
    }
    if (roleFilter !== 'all') {
      params.role = roleFilter as PlanRole;
    }
    if (statusFilter !== 'all') {
      params.isActive = statusFilter === 'active';
    }
    return params;
  }, [typeFilter, roleFilter, statusFilter]);

  // Fetch plans via TanStack React Query
  const { data: rawPlans, isLoading, isError, error, refetch } = usePlans(apiParams);

  // Filter plans with local search and client criteria
  const plans = useMemo(() => {
    if (!rawPlans) return [];
    return filterPlans(rawPlans, {
      search,
      type: typeFilter !== 'all' ? (typeFilter as PlanType) : undefined,
      role: roleFilter !== 'all' ? (roleFilter as PlanRole) : undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    });
  }, [rawPlans, search, typeFilter, roleFilter, statusFilter]);

  // Calculate high-level metrics
  const metrics = useMemo(() => {
    const all = rawPlans || [];
    const subscriptions = all.filter((p) => p.planType === 'subscription');
    const venueMemberships = all.filter((p) => p.planType === 'venue_membership');
    const activePlans = all.filter((p) => p.isActive);

    return {
      total: all.length,
      subscriptions: subscriptions.length,
      venueMemberships: venueMemberships.length,
      active: activePlans.length,
    };
  }, [rawPlans]);

  // Open edit modal for a plan
  const handleEditPlan = (plan: Plan) => {
    setEditingPlanType(plan.planType);
    setEditingPlanId(plan._id);
    setIsEditModalOpen(true);
  };

  // Callback when a plan edit is saved successfully
  const handleEditSuccess = (result: { plan: Plan; migration?: PriceMigrationSummary }) => {
    if (result.migration) {
      setMigrationPlanLabel(result.plan.label);
      setMigrationSummary(result.migration);
      setIsMigrationDialogOpen(true);
    }
    refetch();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setRoleFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
  };

  const hasActiveFilters =
    roleFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || search.length > 0;

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (error as { message?: string })?.message ||
    'Failed to load plans.';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-primary" /> Plan Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure subscription tiers, venue memberships, pricing structures, and subscriber migrations.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border bg-muted/40 p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 px-2.5 text-xs gap-1.5 shadow-none"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2.5 text-xs gap-1.5 shadow-none"
              aria-label="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Plans</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">{metrics.total}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Configured across all interfaces</p>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-2xs border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Subscriptions</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
            {metrics.subscriptions}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recurring campaign tiers</p>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-2xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Venue Memberships</span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {metrics.venueMemberships}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">VIP & lounge access</p>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-2xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Active Plans</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {metrics.active}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Available for purchase</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-2xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans by name, key, feature..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-36 sm:w-40 text-xs">
              <SelectValue placeholder="Plan Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plan Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="venue_membership">Venue Membership</SelectItem>
            </SelectContent>
          </Select>

          {/* Interface / Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-36 sm:w-40 text-xs">
              <SelectValue placeholder="Role / Interface" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="lounge_manager">Lounge Manager</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 text-xs px-2.5 text-destructive hover:bg-destructive/10"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="border rounded-xl p-5 space-y-4 animate-pulse bg-muted/20">
              <div className="flex justify-between items-center">
                <div className="h-5 w-28 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-10 w-1/2 bg-muted rounded" />
              <div className="space-y-2 pt-2 border-t">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
              <div className="h-9 w-full bg-muted rounded pt-4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="font-semibold text-lg text-foreground">Failed to load plans</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Retry Loading
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 flex flex-col items-center justify-center">
          <EmptyState
            title={hasActiveFilters ? 'No matching plans found' : 'No plans configured'}
            description={
              hasActiveFilters
                ? 'Try adjusting or clearing your filters to see more results.'
                : 'There are currently no subscription or venue membership plans available.'
            }
            icon={<Layers className="h-10 w-10 text-muted-foreground" />}
          />
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
              Clear All Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} onEdit={handleEditPlan} />
          ))}
        </div>
      ) : (
        /* Table Audit View */
        <div className="rounded-xl border overflow-hidden bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12 text-center">Type</TableHead>
                  <TableHead>Plan Label & Key</TableHead>
                  <TableHead>Target Interface / Role</TableHead>
                  <TableHead>Price & Interval</TableHead>
                  <TableHead>Features / Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const isSub = plan.planType === 'subscription';
                  const subPlan = isSub ? (plan as SubscriptionPlan) : null;
                  const venuePlan = !isSub ? (plan as VenueMembershipPlan) : null;
                  const roles = isSub
                    ? subPlan?.allowedRoles || plan.interfaces || ['user']
                    : plan.interfaces || ['user'];

                  return (
                    <TableRow key={plan._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center">
                        {isSub ? (
                          <span
                            title="Subscription Tier"
                            className="inline-flex p-1.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          >
                            <Layers className="h-4 w-4" />
                          </span>
                        ) : (
                          <span
                            title="Venue Membership"
                            className="inline-flex p-1.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          >
                            <Crown className="h-4 w-4" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{plan.label}</div>
                        <span className="font-mono text-xs text-muted-foreground">{plan.key}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {roles.map((r) => (
                            <span
                              key={r}
                              className="text-[11px] bg-muted px-2 py-0.5 rounded font-medium capitalize"
                            >
                              {r.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm">
                          {plan.currency?.toUpperCase()} {Number(plan.displayPrice).toFixed(2)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isSub
                            ? `Every ${subPlan?.durationDays ?? 30} days`
                            : `Billed ${venuePlan?.billingInterval ?? 'monthly'}`}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {isSub && subPlan?.features ? (
                          <span className="text-xs text-muted-foreground truncate block">
                            {subPlan.features.length} feature{subPlan.features.length !== 1 ? 's' : ''}:{' '}
                            {subPlan.features.slice(0, 2).join(', ')}
                            {subPlan.features.length > 2 && '…'}
                          </span>
                        ) : venuePlan?.description ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {venuePlan.description}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={plan.isActive ? 'active' : 'inactive'} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                          className="h-8 px-2.5 text-xs gap-1.5 font-medium"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Plan Edit Modal */}
      <PlanEditModal
        planType={editingPlanType}
        planId={editingPlanId}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Migration Summary Dialog */}
      <PlanMigrationSummaryDialog
        open={isMigrationDialogOpen}
        onOpenChange={setIsMigrationDialogOpen}
        planLabel={migrationPlanLabel}
        summary={migrationSummary}
      />
    </div>
  );
}
