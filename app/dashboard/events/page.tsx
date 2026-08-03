'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/use-events';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarDays } from 'lucide-react';
import type { Event } from '@/types/event';
import { useRouter } from 'next/navigation';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount?: number) {
  if (amount == null) return '—';
  return `$${amount.toLocaleString()}`;
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const { data, isLoading, isError, error } = useEvents({
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  });

  const columns: Column<Event>[] = [
    {
      key: 'guest',
      header: 'Guest',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.guestName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.guestEmail ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'lounge',
      header: 'Lounge',
      cell: (row) => (
        <span className="text-sm">{row.loungeId?.name ?? '—'}</span>
      ),
    },
    {
      key: 'package',
      header: 'Package',
      cell: (row) => (
        <span className="text-sm">{row.servicePackageIds?.[0]?.name ?? '—'}</span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      cell: (row) => (
        <span className="text-sm">{formatCurrency(row.budget)}</span>
      ),
    },
    {
      key: 'guests',
      header: 'Guests',
      cell: (row) => (
        <span className="text-sm">{row.guestCount ?? '—'}</span>
      ),
    },
    {
      key: 'eventDate',
      header: 'Event Date',
      cell: (row) => (
        <span className="text-sm">{formatDate(row.startDateTime)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load events';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6" /> Event Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all events across lounges
        </p>
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMsg}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search events..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/events/${row._id}`)}
        emptyTitle="No events found"
        emptyDescription="No events match your current filters."
        toolbar={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
