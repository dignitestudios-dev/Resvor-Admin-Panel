'use client';

import { useState } from 'react';
import { usePayments, usePayment } from '@/hooks/use-payments';
import { exportPaymentsCsv } from '@/lib/api/payments.api';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Download, Calendar, ArrowRightLeft, ShieldCheck, Database } from 'lucide-react';
import type { Payment } from '@/types/payment';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTxId, setDetailsTxId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = usePayments({
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    purpose: purposeFilter !== 'all' ? purposeFilter : undefined,
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const downloadUrl = await exportPaymentsCsv();
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export payments CSV', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetails = (txId: string) => {
    setDetailsTxId(txId);
    setDetailsOpen(true);
  };

  const columns: Column<Payment>[] = [
    {
      key: 'referenceId',
      header: 'Reference ID',
      cell: (row) => (
        <span className="text-xs font-mono font-semibold text-muted-foreground">
          {row.referenceId}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      cell: (row) => {
        const name = [row.ownerId?.firstName, row.ownerId?.lastName].filter(Boolean).join(' ') || '—';
        return (
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{row.ownerId?.email ?? ''}</p>
          </div>
        );
      },
    },
    {
      key: 'purpose',
      header: 'Purpose',
      cell: (row) => (
        <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium capitalize">
          {(row.purpose ?? '').replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row) => (
        <span className="text-sm text-foreground/80 font-medium capitalize">
          {(row.type ?? '').replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row) => (
        <span className="text-sm font-bold">
          {row.currency?.toUpperCase()} {row.amount?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load payments';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6" /> Payment Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and audit all platform transaction ledgers
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
        searchPlaceholder="Search payments..."
        onPageChange={setPage}
        onRowClick={(row) => handleViewDetails(row._id)}
        emptyTitle="No transactions found"
        emptyDescription="No payment logs match your current filters."
        toolbar={
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 sm:w-40 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="IN_PROCESS">In Process</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="WITHHELD">Withheld</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={purposeFilter}
              onValueChange={(v) => {
                setPurposeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 sm:w-48 h-9">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="BOOKING_PAYMENT">Booking Payment</SelectItem>
                <SelectItem value="WALLET_TOPUP">Wallet Topup</SelectItem>
                <SelectItem value="TABLE_BOOKING">Table Booking</SelectItem>
                <SelectItem value="EVENT_BOOKING">Event Booking</SelectItem>
                <SelectItem value="FLYER_CAMPAIGN">Flyer Campaign</SelectItem>
                <SelectItem value="PLATFORM_FEE">Platform Fee</SelectItem>
                <SelectItem value="EVENT_PAYMENT">Event Payment</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <PaymentDetailsModal
        txId={detailsTxId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

function PaymentDetailsModal({
  txId,
  open,
  onOpenChange,
}: {
  txId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: tx, isLoading, isError } = usePayment(txId ?? '');

  if (!txId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction Audit Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded-xl" />
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : isError || !tx ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Failed to load transaction details.
          </p>
        ) : (
          <div className="space-y-6 pt-4 text-sm">
            {/* Amount Banner */}
            <div className="bg-muted/40 p-4 rounded-xl border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Transaction Amount</span>
                <span className="text-2xl font-bold text-foreground">
                  {tx.currency?.toUpperCase()} {tx.amount?.toLocaleString()}
                </span>
              </div>
              <StatusBadge status={tx.status} className="text-xs" />
            </div>

            {/* General Ledger Fields */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Reference ID</span>
                <span className="font-mono text-xs select-all font-semibold">{tx.referenceId}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Trace ID</span>
                <span className="font-mono text-xs select-all text-muted-foreground truncate block max-w-40" title={tx.traceId ?? ''}>
                  {tx.traceId ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Purpose</span>
                <span className="capitalize">{tx.purpose?.replace('_', ' ') ?? '—'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Type</span>
                <span className="capitalize">{tx.type?.replace('_', ' ') ?? '—'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Ledger Model</span>
                <span>{tx.ownerModel ?? '—'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Logged Date</span>
                <span>{new Date(tx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Owner Section */}
            {tx.ownerId && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase flex items-center gap-1.5">
                  <Database className="h-4 w-4" /> Account Information
                </h4>
                <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="font-bold text-blue-700 text-sm">
                      {getInitials([tx.ownerId.firstName, tx.ownerId.lastName].filter(Boolean).join(' '))}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{[tx.ownerId.firstName, tx.ownerId.lastName].filter(Boolean).join(' ')}</p>
                    <p className="text-xs text-muted-foreground">{tx.ownerId.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Fields */}
            {tx.metadata && Object.keys(tx.metadata).length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase flex items-center gap-1.5">
                  <ArrowRightLeft className="h-4 w-4" /> Relational Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-muted/10 p-3 rounded-lg border font-mono text-xxs text-muted-foreground">
                  {tx.metadata.bookingId && (
                    <div>
                      <span className="block font-semibold uppercase text-[10px] text-muted-foreground/80 mb-0.5">Booking ID</span>
                      <span className="select-all">{tx.metadata.bookingId}</span>
                    </div>
                  )}
                  {tx.metadata.escrowId && (
                    <div>
                      <span className="block font-semibold uppercase text-[10px] text-muted-foreground/80 mb-0.5">Escrow ID</span>
                      <span className="select-all">{tx.metadata.escrowId}</span>
                    </div>
                  )}
                  {tx.metadata.sourceId && (
                    <div>
                      <span className="block font-semibold uppercase text-[10px] text-muted-foreground/80 mb-0.5">Source ID</span>
                      <span className="select-all">{tx.metadata.sourceId} (Model: {tx.metadata.sourceModel})</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
