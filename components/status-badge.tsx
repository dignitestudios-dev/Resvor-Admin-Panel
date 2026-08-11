'use client';

import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'published'
  | 'draft'
  | 'expired'
  | 'verified'
  | 'unverified'
  | 'refunded'
  | 'failed'
  | 'in_process'
  | 'in_progress'
  | 'in-progress'
  | 'in_transit'
  | 'withheld'
  | 'holding'
  | 'in_escrow'
  | 'released'
  | 'disputed'
  | 'delivered'
  | 'upcoming'
  | 'ongoing'
  | 'subscribed'
  | string
  | undefined
  | null;

interface StatusStyle {
  label?: string;
  className: string;
  dotClassName: string;
}

const statusStyles: Record<string, StatusStyle> = {
  // Positive / Success (Green / Emerald)
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  released: {
    label: 'Released',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },
  published: {
    label: 'Published',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dotClassName: 'bg-emerald-500',
  },

  // In-Progress / Processing (Sky / Blue / Indigo)
  in_progress: {
    label: 'In Progress',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    dotClassName: 'bg-sky-500',
  },
  in_process: {
    label: 'In Process',
    className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    dotClassName: 'bg-sky-500',
  },
  in_transit: {
    label: 'In Transit',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dotClassName: 'bg-indigo-500',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dotClassName: 'bg-blue-500',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    dotClassName: 'bg-teal-500',
  },
  holding: {
    label: 'Holding',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dotClassName: 'bg-indigo-500',
  },
  in_escrow: {
    label: 'In Escrow',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    dotClassName: 'bg-indigo-500',
  },
  subscribed: {
    label: 'Subscribed',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dotClassName: 'bg-amber-500',
  },

  // Pending / Warning (Amber / Orange)
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dotClassName: 'bg-amber-500',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dotClassName: 'bg-amber-500',
  },
  withheld: {
    label: 'Withheld',
    className: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    dotClassName: 'bg-orange-500',
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    dotClassName: 'bg-orange-500',
  },

  // Negative / Danger (Red / Rose)
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClassName: 'bg-rose-500',
  },
  failed: {
    label: 'Failed',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClassName: 'bg-rose-500',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClassName: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClassName: 'bg-rose-500',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    dotClassName: 'bg-rose-500',
  },

  // Neutral / Gray / Purple
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClassName: 'bg-slate-400',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    dotClassName: 'bg-purple-500',
  },
};

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/[-\s]+/g, '_');
}

function formatFallbackLabel(str: string): string {
  return str
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  status?: StatusVariant;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  if (!status) return null;

  const key = normalizeKey(status);
  const config = statusStyles[key] || {
    label: formatFallbackLabel(status),
    className:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClassName: 'bg-slate-400',
  };

  const label = config.label || formatFallbackLabel(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs whitespace-nowrap shrink-0 transition-colors',
        config.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClassName)}
        />
      )}
      <span>{label}</span>
    </span>
  );
}
