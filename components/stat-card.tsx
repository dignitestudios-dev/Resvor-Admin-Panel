'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value?: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  isLoading?: boolean;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  isLoading = false,
  description,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {value ?? '—'}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn('rounded-xl p-3 shrink-0', iconBg)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
