'use client';

import { useState } from 'react';
import { useFlyers, useFlyerAnalytics } from '@/hooks/use-flyers';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileImage, Users, Radio, MessageSquare, Mail, Layers } from 'lucide-react';
import type { Flyer } from '@/types/flyer';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FlyersPage() {
  const [page, setPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState('all');
  const router = useRouter();

  const { data, isLoading, isError, error } = useFlyers({
    page,
    limit: 10,
    channel: channelFilter !== 'all' ? (channelFilter as 'email' | 'sms') : undefined,
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useFlyerAnalytics();

  const columns: Column<Flyer>[] = [
    {
      key: 'image',
      header: 'Flyer Preview',
      cell: (row) => (
        <div className="relative h-14 w-10 overflow-hidden rounded border bg-muted shrink-0">
          <Image
            src={row.image?.url}
            alt="Flyer campaign"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender / Source',
      cell: (row) => {
        let name = '—';
        let email = '';
        if (row.senderModel === 'LoungeManager') {
          name = row.senderId?.name ?? row.loungeId?.name ?? 'Lounge Manager';
          email = row.loungeId?.businessEmail ?? '';
        } else {
          name = [row.senderId?.firstName, row.senderId?.lastName].filter(Boolean).join(' ') || 'User Campaign';
          email = row.senderId?.email ?? '';
        }
        return (
          <div>
            <p className="font-semibold text-sm">{name}</p>
            {email && <p className="text-xs text-muted-foreground">{email}</p>}
            {row.senderModel === 'LoungeManager' && row.loungeId && (
              <span className="text-[10px] mt-0.5 bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 font-semibold px-1.5 py-0.5 rounded block w-fit">
                Lounge Manager
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'channel',
      header: 'Channel',
      cell: (row) => (
        <span className="text-xs font-semibold uppercase flex items-center gap-1.5">
          {row.channel === 'email' ? (
            <Mail className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
          )}
          {row.channel}
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Delivery Summary',
      cell: (row) => {
        const delivered = row.recipientSummary?.find((s) => s.status === 'DELIVERED')?.count ?? 0;
        const failed = row.recipientSummary?.find((s) => s.status === 'FAILED')?.count ?? 0;
        const pending = row.recipientSummary?.find((s) => s.status === 'PENDING')?.count ?? 0;
        const total = delivered + failed + pending;
        return (
          <div className="space-y-1 text-xs">
            <div className="font-medium text-foreground">{total} total recipients</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-600 font-medium">{delivered} delivered</span>
              {failed > 0 && <span className="text-destructive font-medium">{failed} failed</span>}
              {pending > 0 && <span className="text-amber-600 font-medium">{pending} pending</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'additionalInfo',
      header: 'Message details',
      cell: (row) => (
        <span className="text-xs text-muted-foreground truncate max-w-64 block" title={row.additionalInfo}>
          {row.additionalInfo ?? '—'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Sent On',
      cell: (row) => <span className="text-sm">{formatDate(row.createdAt)}</span>,
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load flyers';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileImage className="h-6 w-6" /> Flyer Campaigns
        </h1>
        <p className="text-muted-foreground">
          Monitor flyers, SMS blasts, and email campaigns sent across the platform
        </p>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campaigns"
          value={analytics?.totals.totalCampaigns ?? 0}
          icon={Layers}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title="Total Recipients"
          value={analytics?.totals.totalRecipients ?? 0}
          icon={Users}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title="Delivery Rate"
          value={analytics?.deliveryRate ?? '0.00%'}
          icon={Radio}
          isLoading={isAnalyticsLoading}
        />
        <StatCard
          title="Channels Used"
          value={
            analytics?.byChannel
              ?.map((c) => `${c.channel.toUpperCase()}: ${c.campaignCount}`)
              .join(' / ') || '—'
          }
          icon={Mail}
          isLoading={isAnalyticsLoading}
        />
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMsg}
        searchValue=""
        onSearchChange={() => {}}
        onRowClick={(row) => router.push(`/dashboard/flyers/${row._id}`)}
        emptyTitle="No campaigns found"
        emptyDescription="No flyer campaigns match your current filters."
        toolbar={
          <Select
            value={channelFilter}
            onValueChange={(v) => {
              setChannelFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
