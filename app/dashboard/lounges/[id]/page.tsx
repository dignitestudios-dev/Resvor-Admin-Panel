'use client';

import { use } from 'react';
import { useLounge } from '@/hooks/use-lounges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

export default function LoungeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: lounge, isLoading, isError } = useLounge(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !lounge) {
    return (
      <EmptyState
        title="Lounge not found"
        description="This lounge may have been removed or you don't have access."
        icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/lounges">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lounge.name}</h1>
          <p className="text-muted-foreground text-sm">Lounge Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <InfoRow label="Lounge Name" value={lounge.name} />
              <InfoRow label="Business Email" value={lounge.businessEmail} />
              <InfoRow label="Business Phone" value={lounge.businessPhone} />
              <InfoRow label="City" value={lounge.city} />
              <InfoRow label="Country" value={lounge.country} />
              <InfoRow
                label="Address"
                value={lounge.location?.address ?? lounge.address}
              />
              <InfoRow label="Registered" value={formatDate(lounge.createdAt)} />
            </CardContent>
          </Card>

          {/* Operating Hours */}
          {lounge.operatingHours && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm font-medium">Daily Schedule</span>
                  <span className="text-sm text-muted-foreground">
                    {lounge.operatingHours.open} – {lounge.operatingHours.close}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Owner Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lounge Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const owner = lounge?.ownerId ;
                if (!owner) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No owner information available.
                    </p>
                  );
                }
                const name = (owner?.fullName ?? [owner.firstName, owner.lastName].filter(Boolean).join(' ')) || '—';
                const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="font-bold text-violet-700 text-sm">
                          {initials || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          Lounge Manager
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {owner.email}
                      </div>
                      {owner.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {owner.phoneNumber}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Description */}
          {lounge.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lounge.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
