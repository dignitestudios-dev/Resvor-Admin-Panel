'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/use-events';
import { exportEventsCsv } from '@/lib/api/events.api';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, Eye, Calendar, Download, Loader2 } from 'lucide-react';
import type { Event } from '@/types/event';
import { formatCurrency, downloadBlob, extractBlobErrorMessage } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // Map legacy 'accepted' to valid backend status 'confirmed'
  const resolvedStatus =
    statusFilter === 'accepted'
      ? 'confirmed'
      : statusFilter !== 'all'
        ? statusFilter
        : undefined;

  // Resolve start date based on custom picker or upcoming timeframe
  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  })();
  const resolvedStartDate =
    startDate ||
    (timeframeFilter === 'upcoming' ? today : undefined);

  // Resolve end date
  const resolvedEndDate =
    endDate ||
    (timeframeFilter === 'past' ? today : undefined);

  const { data, isLoading, isError, error } = useEvents({
    page,
    limit: 10,
    status: resolvedStatus,
    startDate: resolvedStartDate,
    endDate: resolvedEndDate,
    search: search || undefined,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportEventsCsv({
        search: search.trim() || undefined,
        status: resolvedStatus,
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
      });
      downloadBlob(blob, 'events.csv');
      toast.success('Events exported successfully');
    } catch (err) {
      console.error('Failed to export events CSV', err);
      const msg = await extractBlobErrorMessage(err, 'Failed to export events CSV');
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

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
      key: 'eventname',
      header: 'Event Name',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.title ?? '—'}</p>
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
        <span className="text-sm whitespace-normal break-words [overflow-wrap:anywhere] max-w-[250px] block">
          {row.servicePackageIds?.[0]?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      cell: (row) => (
        <span className="text-sm">{formatCurrency(row.budget, row.currency)}</span>
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
        <span className="text-sm font-medium">{formatDate(row.startDateTime)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 font-medium hover:bg-muted shadow-2xs group cursor-pointer"
            onClick={() => router.push(`/dashboard/events/${row._id}`)}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span>View</span>
          </Button>
        </div>
      ),
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load events';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6" /> Event Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all events across promoters & lounges
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto shrink-0 shadow-sm"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Date Filters Row */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-lg border">
        <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5 px-1">
          <Calendar className="h-3.5 w-3.5" /> Date Filter
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setTimeframeFilter('all');
              setPage(1);
            }}
            className="h-9 text-xs w-full sm:w-36 bg-background"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setTimeframeFilter('all');
              setPage(1);
            }}
            className="h-9 text-xs w-full sm:w-36 bg-background"
          />
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-xs h-9 px-2.5 text-destructive"
            >
              Clear
            </Button>
          )}
        </div>
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
        searchPlaceholder="Search by event name..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/events/${row._id}`)}
        emptyTitle="No events found"
        emptyDescription="No events match your current filters."
        toolbar={
          <div className="flex gap-2 flex-wrap">
            <Select
              value={timeframeFilter}
              onValueChange={(v) => {
                setTimeframeFilter(v);
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Events</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
