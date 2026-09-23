'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/use-bookings';
import { exportBookingsCsv } from '@/lib/api/bookings.api';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarCheck, Download, Calendar, Eye } from 'lucide-react';
import type { Booking } from '@/types/booking';
import { useRouter } from 'next/navigation';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
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

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError, error } = useBookings({
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const downloadUrl = await exportBookingsCsv();
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<Booking>[] = [
    {
      key: 'guest',
      header: 'Guest Details',
      cell: (row) => {
        const name = row.guestName || [row.userId?.firstName, row.userId?.lastName].filter(Boolean).join(' ') || '—';
        return (
          <div>
            <p className="font-semibold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{row.guestEmail}</p>
          </div>
        );
      },
    },
    {
      key: 'lounge',
      header: 'Lounge',
      cell: (row) => <span className="text-sm font-medium">{row.loungeId?.name ?? '—'}</span>,
    },
    {
      key: 'table',
      header: 'Tables',
      cell: (row) => {
        const codes = row.tableIds?.map((t) => t.code).join(', ') || '—';
        return <span className="text-sm font-mono bg-muted/60 px-2 py-0.5 rounded">{codes}</span>;
      },
    },
    {
      key: 'bookingDate',
      header: 'Booking Date',
      cell: (row) => <span className="text-sm">{formatDate(row.bookingDate)}</span>,
    },
    {
      key: 'time',
      header: 'Time Window',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatTime(row.startTime)} - {formatTime(row.endTime)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      cell: (row) => (
        <span className="text-sm font-semibold">
          {formatCurrency(row.amountPaid, row.currency)}
        </span>
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
            onClick={() => router.push(`/dashboard/bookings/${row._id}`)}
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
      ?.message ?? 'Failed to load bookings';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" /> Booking Management
          </h1>
          <p className="text-muted-foreground">
            Manage table bookings and reservations across promoters & lounges
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto shrink-0 shadow-sm"
        >
          <Download className="mr-2 h-4 w-4" />
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
        searchPlaceholder="Search bookings..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/bookings/${row._id}`)}
        emptyTitle="No bookings found"
        emptyDescription="No reservations match your current filters."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
