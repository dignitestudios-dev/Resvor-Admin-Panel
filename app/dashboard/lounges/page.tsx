'use client';

import { useState, Suspense } from 'react';
import { useLounges, useDeleteLounge } from '@/hooks/use-lounges';
import { useTableQuery } from '@/hooks/use-table-query';
import { DataTable, Column } from '@/components/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { TableSkeleton } from '@/components/table-skeleton';
import { Building2, MapPin, Eye, Trash2 } from 'lucide-react';
import type { Lounge } from '@/types/lounge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

function LoungesContent() {
  const { query, setPage, setSearch } = useTableQuery({
    defaultValues: {
      page: 1,
      search: '',
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<Lounge | null>(null);
  const router = useRouter();

  const { data, isLoading, isError, error } = useLounges({
    page: query.page,
    limit: 10,
    search: query.search || undefined,
  });

  const deleteMutation = useDeleteLounge();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(res?.message || 'Lounge deleted successfully');
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          'Failed to delete lounge'
      );
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns: Column<Lounge>[] = [
    {
      key: 'name',
      header: 'Lounge',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarFallback className="rounded-lg text-xs bg-violet-100 text-violet-700">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.businessEmail ?? '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row?.ownerId?.firstName ?? row?.ownerId?.fullName ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row?.ownerId?.email ?? ''}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Business Phone',
      cell: (row) => (
        <span className="text-sm">{row.businessPhone ?? '—'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Address',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-48 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {row?.location?.address || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-28 text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5 font-medium hover:bg-muted shadow-2xs group cursor-pointer"
            onClick={() => router.push(`/dashboard/lounges/${row._id}`)}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span>View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shadow-2xs cursor-pointer"
            onClick={() => setDeleteTarget(row)}
            title="Delete lounge"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load promoters & lounges';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6" /> Promoters & Lounges
        </h1>
        <p className="text-muted-foreground">
          View and manage all registered promoters & lounges
        </p>
      </div>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMsg}
        searchValue={query.search}
        onSearchChange={setSearch}
        searchPlaceholder="Search promoters & lounges..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/lounges/${row._id}`)}
        emptyTitle="No promoters & lounges found"
        emptyDescription="No promoters & lounges match your search criteria."
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Lounge"
        description={`Are you sure you want to delete "${deleteTarget?.name || 'this lounge'}"? It will be removed from all active lounge listings. This action cannot be undone.`}
        confirmLabel="Delete Lounge"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}

export default function LoungesPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
      <LoungesContent />
    </Suspense>
  );
}
