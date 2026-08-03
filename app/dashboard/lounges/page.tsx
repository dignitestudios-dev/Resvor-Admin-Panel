'use client';

import { useState } from 'react';
import { useLounges } from '@/hooks/use-lounges';
import { DataTable, Column } from '@/components/data-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, MapPin } from 'lucide-react';
import type { Lounge } from '@/types/lounge';
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

export default function LoungesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { data, isLoading, isError, error } = useLounges({
    page,
    limit: 10,
    search: search || undefined,
  });

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
      key: 'address',
      header: 'Address',
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-48 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {row?.address || '—'}
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
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load lounges';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6" /> Lounge Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all registered lounges
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
        searchPlaceholder="Search lounges..."
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/dashboard/lounges/${row._id}`)}
        emptyTitle="No lounges found"
        emptyDescription="No lounges match your search criteria."
      />
    </div>
  );
}
