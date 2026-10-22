'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { calculatePriceChange } from '@/lib/plan-utils';
import { AlertTriangle, ArrowRight, Loader2, TrendingDown, TrendingUp } from 'lucide-react';

interface PlanPriceConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planLabel: string;
  currency: string;
  oldPrice: number;
  newPrice: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function PlanPriceConfirmDialog({
  open,
  onOpenChange,
  planLabel,
  currency,
  oldPrice,
  newPrice,
  isSubmitting,
  onConfirm,
  onCancel,
}: PlanPriceConfirmDialogProps) {
  const calculation = calculatePriceChange(oldPrice, newPrice, currency);

  const handleCancel = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={isSubmitting ? () => {} : onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg border-amber-300/40 dark:border-amber-700/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500 mb-1">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950/70">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Confirm Price Update
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-foreground/85 leading-relaxed pt-1">
            Changing this price will update existing subscribers. They will not be charged
            immediately, but the new price will apply at their next renewal. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Price Comparison Card */}
        <div className="my-2 rounded-xl border border-muted bg-muted/30 p-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Change for: <span className="text-foreground font-bold">{planLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            {/* Old Price */}
            <div className="flex-1 text-center p-3 rounded-lg bg-background/80 border">
              <div className="text-xs text-muted-foreground font-medium mb-1">Existing Price</div>
              <div className="text-lg font-bold line-through text-muted-foreground">
                {currency.toUpperCase()} {oldPrice.toFixed(2)}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center shrink-0">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* New Price */}
            <div className="flex-1 text-center p-3 rounded-lg bg-background/80 border border-primary/30">
              <div className="text-xs text-primary font-medium mb-1">New Price</div>
              <div className="text-xl font-black text-foreground">
                {currency.toUpperCase()} {newPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Difference Banner */}
          <div className="flex items-center justify-between text-xs px-2 pt-1 border-t border-muted/70">
            <span className="text-muted-foreground font-medium">Difference:</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                calculation.isIncrease
                  ? 'text-amber-600 dark:text-amber-400'
                  : calculation.isDecrease
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground'
              }`}
            >
              {calculation.isIncrease && <TrendingUp className="h-3.5 w-3.5" />}
              {calculation.isDecrease && <TrendingDown className="h-3.5 w-3.5" />}
              {calculation.formattedDiff}
            </span>
          </div>
        </div>

        {isSubmitting && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Updating plan and subscriber pricing… This may take a few moments.</span>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isSubmitting}
            onClick={handleCancel}
            className="sm:mr-2"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating price and subscribers…
              </>
            ) : (
              'Update price and subscribers'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
