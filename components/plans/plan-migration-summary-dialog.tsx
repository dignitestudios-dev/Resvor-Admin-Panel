'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Users, Archive, RefreshCw } from 'lucide-react';
import type { PriceMigrationSummary } from '@/types/plan';

interface PlanMigrationSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planLabel: string;
  summary: PriceMigrationSummary | null;
}

export function PlanMigrationSummaryDialog({
  open,
  onOpenChange,
  planLabel,
  summary,
}: PlanMigrationSummaryDialogProps) {
  if (!summary) return null;

  const hasArchiveIssue = summary.oldPriceArchived === false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-500 mb-1">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-950/70">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Price Migration Complete
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            Pricing update and subscriber migration for{' '}
            <span className="font-semibold text-foreground">{planLabel}</span> have finished.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-2">
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
              <Users className="h-3.5 w-3.5" /> Matched Subscribers
            </div>
            <div className="text-xl font-bold">{summary.matched}</div>
          </div>

          <div className="p-3 rounded-lg border bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">
              <RefreshCw className="h-3.5 w-3.5" /> Migrated
            </div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {summary.migrated}
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              Already Migrated
            </div>
            <div className="text-xl font-bold text-muted-foreground">
              {summary.alreadyMigrated}
            </div>
          </div>

          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="text-xs text-muted-foreground font-medium mb-1">
              No Longer Billable
            </div>
            <div className="text-xl font-bold text-muted-foreground">
              {summary.noLongerBillable}
            </div>
          </div>

          {summary.failed > 0 && (
            <div className="col-span-2 p-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
              <div className="text-xs font-semibold uppercase mb-0.5">Failed Migrations</div>
              <div className="text-xl font-bold">{summary.failed}</div>
            </div>
          )}
        </div>

        {/* Old Price Archived Status */}
        <div className="flex items-center justify-between text-xs p-3 rounded-lg border bg-muted/20">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Archive className="h-3.5 w-3.5" /> Old Stripe Price Archived
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-xs ${
              summary.oldPriceArchived
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            }`}
          >
            {summary.oldPriceArchived ? 'Yes' : 'No'}
          </span>
        </div>

        {/* Non-blocking Warning if oldPriceArchived is false */}
        {hasArchiveIssue && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Archive Notice</span>
              <span>
                The plan and subscribers were updated successfully, but the old Stripe Price
                could not be automatically archived. You may archive it manually in your Stripe
                dashboard if needed.
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
