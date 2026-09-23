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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreVertical, ShieldOff, ShieldCheck, Briefcase } from 'lucide-react';
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
  const [suspendedFilter, setSuspendedFilter] = useState<string>('all');
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBartender, setSelectedBartender] = useState<Bartender | null>(null);
  const [action, setAction] = useState<'suspend' | 'activate'>('suspend');

  const { data, isLoading, isError, error } = useBartenders({
    page,
    limit: 10,
    search: search || undefined,
    isSuspended:
      suspendedFilter === 'suspended'
        ? true
        : suspendedFilter === 'active'
          ? false
          : undefined,
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
      header: 'Worker',
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
      key: 'designation',
      header: 'Designation',
      cell: (row) => {
        const designation =
          row.designation ||
          (row as any).position ||
          (row as any).jobTitle ||
          (row as any).workerType ||
          ((row as any).role && (row as any).role.toLowerCase() !== 'bartender' ? (row as any).role : undefined);

        if (!designation) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }

        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 capitalize">
            {designation}
          </span>
        );
      },
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
    // {
    //   key: 'verified',
    //   header: 'Verified',
    //   cell: (row) => (
    //     <StatusBadge status={row.isEmailVerified ? 'verified' : 'unverified'} />
    //   ),
    // },
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
      ?.message ?? 'Failed to load workforce';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6" /> Workforce Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage all workforce accounts and designations
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
        searchPlaceholder="Search workforce..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/bartenders/${row._id}`)}
        emptyTitle="No workforce found"
        emptyDescription="No workforce accounts match your current filters."
        toolbar={
          <Select
            value={suspendedFilter}
            onValueChange={(v) => {
              setSuspendedFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={action === 'suspend' ? 'Suspend Worker' : 'Activate Worker'}
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
