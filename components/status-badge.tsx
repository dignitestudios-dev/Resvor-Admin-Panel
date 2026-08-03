'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'accepted'
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
  | string;

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  published: {
    label: 'Published',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  unverified: {
    label: 'Unverified',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedStatus] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-0 capitalize',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
