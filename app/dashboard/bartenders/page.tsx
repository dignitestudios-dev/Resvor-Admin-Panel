'use client';

import { useState } from 'react';
import { useBartenders, useSuspendBartender, useActivateBartender } from '@/hooks/use-bartenders';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ShieldOff, ShieldCheck, Wine } from 'lucide-react';
import type { Bartender } from '@/types/bartender';
import { useRouter } from 'next/navigation';

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BartendersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBartender, setSelectedBartender] = useState<Bartender | null>(null);
  const [action, setAction] = useState<'suspend' | 'activate'>('suspend');

  const { data, isLoading, isError, error } = useBartenders({
    page,
    limit: 10,
    search: search || undefined,
  });

  const suspendMutation = useSuspendBartender();
  const activateMutation = useActivateBartender();

  const handleAction = (bartender: Bartender, act: 'suspend' | 'activate') => {
    setSelectedBartender(bartender);
    setAction(act);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedBartender) return;
    if (action === 'suspend') {
      await suspendMutation.mutateAsync(selectedBartender._id);
    } else {
      await activateMutation.mutateAsync(selectedBartender._id);
    }
    setConfirmOpen(false);
    setSelectedBartender(null);
  };

  const isActionLoading = suspendMutation.isPending || activateMutation.isPending;

  const columns: Column<Bartender>[] = [
    {
      key: 'bartender',
      header: 'Bartender',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
              {getInitials(row.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => <span className="text-sm">{row.phoneNumber ?? '—'}</span>,
    },
    {
      key: 'lounge',
      header: 'Assigned Lounge',
      cell: (row) => (
        <span className="text-sm">{row.loungeId?.name ?? '—'}</span>
      ),
    },
    {
      key: 'verified',
      header: 'Verified',
      cell: (row) => (
        <StatusBadge status={row.isEmailVerified ? 'verified' : 'unverified'} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge status={row.isSuspended ? 'suspended' : 'active'} />
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {row.isSuspended ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(row, 'activate');
                }}
                className="text-emerald-600"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(row, 'suspend');
                }}
                className="text-destructive"
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Suspend
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load bartenders';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wine className="h-6 w-6" /> Bartender Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage all bartender accounts
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
        searchPlaceholder="Search bartenders..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/bartenders/${row._id}`)}
        emptyTitle="No bartenders found"
        emptyDescription="No bartender accounts match your current filters."
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={action === 'suspend' ? 'Suspend Bartender' : 'Activate Bartender'}
        description={
          action === 'suspend'
            ? `Are you sure you want to suspend ${selectedBartender?.fullName}?`
            : `Are you sure you want to activate ${selectedBartender?.fullName}?`
        }
        confirmLabel={action === 'suspend' ? 'Suspend' : 'Activate'}
        variant={action === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
}
