'use client';

import { use } from 'react';
import { useBooking } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarCheck, Users, DollarSign, Building2, Layers, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, cn } from '@/lib/utils';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(isoString?: string) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 min-w-0", className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium break-words [overflow-wrap:anywhere]">
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: booking, isLoading, isError } = useBooking(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="This booking reservation may have been removed."
        icon={<CalendarCheck className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  const user = booking.userId;
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || booking.guestName || '—';
  const escrow = typeof booking.escrowId === 'object' ? booking.escrowId : null;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
            <p className="text-muted-foreground text-sm">
              Reservation for {formatDate(booking.bookingDate)}
            </p>
          </div>
          <StatusBadge status={booking.status} className="text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile / Client Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Guest & Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-bold text-blue-700 text-sm">
                  {userName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-xs text-muted-foreground">Guest Contact</p>
              </div>
            </div>
            <div className="space-y-3 text-sm border-t pt-4">
              <InfoRow label="Guest Name" value={booking.guestName} />
              <InfoRow label="Guest Email" value={booking.guestEmail} />
              <InfoRow label="Guest Phone" value={booking.guestPhone} />
              {user && (
                <div className="border-t pt-3 mt-3">
                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-2">Registered User</span>
                  <div className="space-y-1 bg-muted/30 p-2.5 rounded border text-xs">
                    <div><span className="text-muted-foreground">Name:</span> {user.firstName} {user.lastName}</div>
                    <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {user.phoneNumber ?? '—'}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details / Setup */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Reservation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Lounge" value={booking.loungeId?.name} />
              <InfoRow label="Lounge Address" value={booking.loungeId?.location?.address} />
              <InfoRow label="Booking Date" value={formatDate(booking.bookingDate)} />
              <InfoRow label="Time Window" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
              <InfoRow label="Adult Guest Count" value={booking.guestCount} />
              <InfoRow label="Children Guest Count" value={booking.childrenCount} />
              <div className="sm:col-span-2 min-w-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-1 font-medium">
                  Special Request Note
                </span>
                <div className="text-sm font-normal bg-muted/30 p-3 rounded-lg border text-foreground break-words [overflow-wrap:anywhere] whitespace-pre-wrap leading-relaxed">
                  {booking.specialRequest?.trim() || '—'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup / Tables & Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tables Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Assigned Tables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!booking.tableIds?.length ? (
                  <p className="text-sm text-muted-foreground">No tables assigned to this booking.</p>
                ) : (
                  booking.tableIds.map((t) => (
                    <div key={t._id} className="flex items-center justify-between border rounded p-2 text-sm bg-muted/20">
                      <span className="font-semibold font-mono bg-muted/80 px-2 py-0.5 rounded text-xs">{t.code}</span>
                      <span className="text-xs text-muted-foreground capitalize">{t.type} (Cap: {t.capacity})</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Service Packages Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Service Packages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!booking.servicePackageIds?.length ? (
                  <p className="text-sm text-muted-foreground">No service packages purchased.</p>
                ) : (
                  booking.servicePackageIds.map((p) => (
                    <div key={p._id} className="border rounded p-2 text-sm bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-xs font-semibold text-emerald-600">
                          {formatCurrency(p.price, booking.currency)}
                        </span>
                      </div>
                      {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment & Transaction Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Payment & Escrow Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Amount Paid
                </span>
                <span className="text-base font-semibold text-emerald-600">
                  {formatCurrency(booking.amountPaid, booking.currency)}
                </span>
              </div>
              <InfoRow label="Paid At Date" value={booking.paidAt ? new Date(booking.paidAt).toLocaleString() : 'Not paid'} />
              {escrow && (
                <div className="sm:col-span-2 border-t pt-3 mt-1">
                  <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider mb-2">Escrow Status</span>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded border">
                    <div><span className="text-muted-foreground">Escrow ID:</span> <span className="font-mono text-xxs">{escrow._id}</span></div>
                    <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Status:</span> <StatusBadge status={escrow.status} /></div>
                    <div><span className="text-muted-foreground">Transaction ID:</span> <span className="font-mono text-xxs truncate block max-w-40">{escrow.transactionId}</span></div>
                    <div><span className="text-muted-foreground">Release Date:</span> {escrow.releasedAt ? new Date(escrow.releasedAt).toLocaleString() : 'Not released'}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
