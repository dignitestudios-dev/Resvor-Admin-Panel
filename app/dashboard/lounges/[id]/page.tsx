
'use client';

import { use } from 'react';
import Link from 'next/link';
import { useLounge } from '@/hooks/use-lounges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  UserRound,
  Pencil,
  Plus,
  Image as ImageIcon,
  LayoutGrid,
  DollarSign,
  FileText,
  CalendarDays,
} from 'lucide-react';

// Format date
function formatDate(dateStr?: string) {
  if (!dateStr) return '—';

  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format currency
function formatPrice(amount?: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount ?? 0);
}

// Get initials
function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// Media URL helper.
// Supports URLs returned directly by the API.
// For ID-only media, connect your existing media URL resolver.
function getImageSrc(media: any): string {
  if (!media) return '';

  if (typeof media === 'string') {
    return media.startsWith('http') || media.startsWith('/')
      ? media
      : '';
  }

  return (
    media.url ||
    media.secure_url ||
    media.path ||
    media.imageUrl ||
    ''
  );
}

// Reusable information box
function InfoBox({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-100 p-3 sm:p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-950 break-words [overflow-wrap:anywhere] capitalize">
        {value ?? '—'}
      </p>
    </div>
  );
}

// Reusable section heading
function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: any;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#000066]" />
        {title}
      </h2>
      {action}
    </div>
  );
}

// Image placeholder
function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400 rounded-xl min-h-48">
      <ImageIcon className="h-10 w-10" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function LoungeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: lounge,
    isLoading,
    isError,
  } = useLounge(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
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

  const owner = lounge.ownerId;
  const ownerName =
    owner?.fullName ||
    [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') ||
    '—';

  const logoSrc = getImageSrc(lounge.logo);




  // Available table counts are derived from total table counts
  // only when the API does not provide separate availability data.


  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3 min-w-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/lounges">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>

          <div className="h-14 w-14 shrink-0 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={lounge.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-7 w-7 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {lounge.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Lounge Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/lounges/create">
              <Plus className="h-4 w-4 mr-1" />
              Add New Lounge
            </Link>
          </Button>

          <Button className="bg-[#000066] hover:bg-[#000044]">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Lounge
          </Button>
        </div>
      </div>

      {/* PROFILE + LOUNGE DETAILS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* USER PROFILE */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <SectionHeading
              icon={UserRound}
              title="User Profile"
            />
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="flex justify-center">
              <div className="h-28 w-28 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-semibold text-slate-600">
                {getInitials(ownerName)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBox
                label="First Name"
                value={owner?.firstName}
              />

              <InfoBox
                label="Last Name"
                value={owner?.lastName}
              />

              <InfoBox
                label="Phone Number"
                value={owner?.phoneNumber}
              />

              <InfoBox
                label="Email"
                value={owner?.email}
              />
            </div>
          </CardContent>
        </Card>

        {/* LOUNGE DETAILS */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <SectionHeading
              icon={Building2}
              title="Lounge Details"
            />
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={lounge.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-slate-400" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {lounge.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Lounge Manager
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <InfoBox
                label="Business Email Address"
                value={lounge.businessEmail}
              />

              <InfoBox
                label="Business Phone Number"
                value={lounge.businessPhone}
              />

              <InfoBox
                label="Operating Hours"
                value={
                  lounge.operatingHours
                    ? `${lounge.operatingHours.open} - ${lounge.operatingHours.close}`
                    : '—'
                }
              />

              <InfoBox
                label="Highlight Specialization"
                value={lounge.specialization}
              />

              <div className="sm:col-span-2">
                <InfoBox
                  label="Business Location"
                  value={
                    lounge.location?.address ??
                    lounge.address
                  }
                />
              </div>

              <InfoBox
                label="Registered Date"
                value={formatDate(lounge.createdAt)}
              />

              <InfoBox
                label="Lounge Role"
                value={lounge.role?.replace(/_/g, ' ')}
              />

            </div>
          </CardContent>
        </Card>
      </div>



    </div>
  );
}
