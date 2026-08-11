'use client';

import { use } from 'react';
import { useEvent } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';

import { formatCurrency } from '@/lib/utils';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium break-words [overflow-wrap:anywhere]">{value ?? '—'}</span>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: event, isLoading, isError } = useEvent(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been removed."
        icon={<CalendarDays className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Detail</h1>
            <p className="text-muted-foreground text-sm">
              {formatDate(event.startDateTime)}
            </p>
          </div>
          <StatusBadge status={event.status} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Title" value={event.title} />
            <InfoRow label="Event Type" value={event.eventType} />
            <InfoRow label="Start Date/Time" value={new Date(event.startDateTime).toLocaleString()} />
            <InfoRow label="End Date/Time" value={new Date(event.endDateTime).toLocaleString()} />
            <InfoRow label="Lounge" value={event.loungeId?.name} />
            <InfoRow label="Package" value={event.servicePackageIds?.[0]?.name} />
            <div className="col-span-2 min-w-0">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1 font-medium">
                Description
              </span>
              <div className="text-sm font-normal bg-muted/30 p-3 rounded-lg border text-foreground break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-relaxed">
                {event.description?.trim() || 'No description provided.'}
              </div>
            </div>
            <div className="col-span-2 min-w-0">
              <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1 font-medium">
                Special Request
              </span>
              <div className="text-sm font-normal bg-muted/30 p-3 rounded-lg border text-foreground break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-relaxed">
                {event.specialRequest?.trim() || 'No special requests.'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest & Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Guest & Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Guest Name" value={event.guestName} />
            <InfoRow label="Guest Email" value={event.guestEmail} />
            <InfoRow label="Guest Phone" value={event.guestPhone} />
            <InfoRow
              label="Guest Count"
              value={event.guestCount?.toString()}
            />
            <div className="flex flex-col gap-0.5 col-span-2 border-t pt-3 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Budget
              </span>
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-emerald-600">
                  {formatCurrency(event.budget, event.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
