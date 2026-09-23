'use client';

import { use } from 'react';
import { useBartender } from '@/hooks/use-bartenders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Wine, Mail, Phone, Building2, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Shift, ShiftRequest } from '@/types/bartender';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BartenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError } = useBartender(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const bartender = data?.bartender;
  const shifts = data?.shifts;
  const shiftRequests = data?.shiftRequests;

  if (isError || !bartender) {
    return (
      <EmptyState
        title="Bartender not found"
        description="This bartender may have been removed."
        icon={<Wine className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bartenders">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{bartender.fullName}</h1>
          <p className="text-muted-foreground text-sm">Workforce Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="font-bold text-amber-700 text-lg">
                  {bartender.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-base">{bartender.fullName}</p>
                {(() => {
                  const designation =
                    bartender.designation ||
                    (bartender as any).position ||
                    (bartender as any).jobTitle ||
                    (bartender as any).workerType ||
                    ((bartender as any).role && (bartender as any).role.toLowerCase() !== 'bartender' ? (bartender as any).role : undefined);
                  return designation ? (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 capitalize">
                        {designation}
                      </span>
                    </div>
                  ) : null;
                })()}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <StatusBadge
                    status={bartender.isSuspended ? 'suspended' : 'active'}
                  />
                  {bartender.isEmailVerified != null && (
                    <StatusBadge
                      status={bartender.isEmailVerified ? 'verified' : 'unverified'}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0 text-foreground/75" />
                <span className="capitalize">
                  {bartender.designation ||
                    (bartender as any).position ||
                    (bartender as any).jobTitle ||
                    (bartender as any).workerType ||
                    ((bartender as any).role && (bartender as any).role.toLowerCase() !== 'bartender' ? (bartender as any).role : '—')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-foreground/75" />
                <span className="truncate">{bartender.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-foreground/75" />
                <span>{bartender.phoneNumber ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0 text-foreground/75" />
                <span>{bartender.loungeId?.name ?? '—'}</span>
              </div>
              {bartender.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Wine className="h-4 w-4 shrink-0 mt-0.5 text-foreground/75" />
                  <span>{bartender.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-foreground/75" />
                <span>Joined {formatDate(bartender.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shifts & Requests Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shifts Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {!shifts?.length ? (
                <EmptyState
                  title="No shifts"
                  description="No shift records found for this bartender."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Date</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shifts.map((shift: Shift) => (
                        <TableRow key={shift._id}>
                          <TableCell className="text-sm font-medium">
                            {formatDate(shift.startDateTime)}
                          </TableCell>
                          <TableCell className="text-sm">{shift.role ?? '—'}</TableCell>
                          <TableCell className="text-sm">
                            {formatTime(shift.startDateTime)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(shift.endDateTime)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={shift.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shift Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shift Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {!shiftRequests?.length ? (
                <EmptyState
                  title="No requests"
                  description="No time-off or swap requests found."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Type</TableHead>
                        <TableHead>Request Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shiftRequests.map((req: ShiftRequest) => (
                        <TableRow key={req._id}>
                          <TableCell className="text-sm font-semibold capitalize">
                            {req.type?.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {req.type === 'shift_swap' ? (
                              <div className="space-y-0.5 text-xs">
                                <div>
                                  <span className="text-muted-foreground">My: </span>
                                  {req.requestorShiftId?.role ?? 'Barista'} (
                                  {formatDate(req.requestorShiftId?.startDateTime)})
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Swap: </span>
                                  {req.targetShiftId?.role ?? '—'} (
                                  {formatDate(req.targetShiftId?.startDateTime)})
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs">
                                Range: {formatDate(req.startDate)} – {formatDate(req.endDate)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-40 truncate">
                            {req.reason ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(req.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
