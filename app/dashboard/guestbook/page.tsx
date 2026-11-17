'use client';

import { useState } from 'react';
import {
  useGuestbookEntries,
  useGuestbookSummary,
  useDeleteGuestbookEntry,
} from '@/hooks/use-guestbook';
import { DataTable, Column } from '@/components/data-table';
import { StatCard } from '@/components/stat-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookUser,
  Building2,
  Users,
  Calendar,
  Mail,
  Phone,
  Cake,
  Gift,
  Trash2,
  Eye,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import type { GuestbookEntry } from '@/types/guestbook';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatBirthMonth(month?: number) {
  if (!month || month < 1 || month > 12) return '—';
  return MONTH_NAMES[month - 1];
}

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
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getPhotoUrl(photo?: GuestbookEntry['photo']): string | undefined {
  if (!photo) return undefined;
  if (typeof photo === 'string') return photo;
  return photo.location || photo.url || photo.secure_url;
}

export default function GuestbookPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loungeFilter, setLoungeFilter] = useState('all');

  const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<GuestbookEntry | null>(null);

  const { data, isLoading, isError, error } = useGuestbookEntries({
    page,
    limit: 10,
    search: search || undefined,
    loungeId: loungeFilter !== 'all' ? loungeFilter : undefined,
  });

  const { data: summary, isLoading: isSummaryLoading } = useGuestbookSummary();
  const deleteMutation = useDeleteGuestbookEntry();

  // Summary statistics calculations
  const totalEntries =
    summary?.reduce((acc, curr) => acc + (curr.entryCount || 0), 0) ??
    data?.pagination?.totalItems ??
    0;
  const totalLounges = summary?.length ?? 0;
  const topLounge = summary && summary.length > 0
    ? [...summary].sort((a, b) => b.entryCount - a.entryCount)[0]
    : null;

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteMutation.mutateAsync(entryToDelete._id);
      toast.success('Guestbook entry deleted successfully');
      if (selectedEntry?._id === entryToDelete._id) {
        setSelectedEntry(null);
      }
      setEntryToDelete(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to delete guestbook entry'
      );
    }
  };

  const columns: Column<GuestbookEntry>[] = [
    {
      key: 'guest',
      header: 'Guest',
      cell: (row) => {
        const photoUrl = getPhotoUrl(row.photo);
        const name = row.fullName || `${row.firstName} ${row.lastName}`.trim() || '—';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 border">
              <AvatarImage src={photoUrl} alt={name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">
                {name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {row.email || '—'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'lounge',
      header: 'Lounge',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium truncate max-w-[180px]">
            {row.loungeId?.name || '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.phoneNumber || '—'}
        </span>
      ),
    },
    {
      key: 'birthMonth',
      header: 'Birth Month',
      cell: (row) => {
        const monthName = formatBirthMonth(row.birthMonth);
        return monthName !== '—' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <Cake className="h-3 w-3" />
            {monthName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'specialDates',
      header: 'Special Dates',
      cell: (row) => {
        const count = row.specialDates?.length ?? 0;
        if (count === 0) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        const first = row.specialDates![0];
        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 truncate max-w-[160px]">
              <Gift className="h-3 w-3 shrink-0" />
              {first.title}: {formatDate(first.date)}
            </span>
            {count > 1 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{count - 1}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Joined On',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="View Details"
            onClick={() => setSelectedEntry(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete Entry"
            onClick={() => setEntryToDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const errorMsg =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? 'Failed to load guestbook entries';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookUser className="h-6 w-6 text-[#000066]" /> Guestbook Management
        </h1>
        <p className="text-muted-foreground text-sm">
          View, search, and manage guestbook entries across every lounge on the platform
        </p>
      </div>

      {/* Summary Stat Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Platform Guests"
          value={totalEntries}
          icon={Users}
          isLoading={isSummaryLoading && isLoading}
          description="Total guestbook entries collected across all lounges"
        />
        <StatCard
          title="Participating Lounges"
          value={totalLounges}
          icon={Building2}
          isLoading={isSummaryLoading}
          description="Lounges with active guestbook entries"
        />
        <StatCard
          title="Most Active Lounge"
          value={topLounge ? topLounge.loungeName : '—'}
          icon={Award}
          isLoading={isSummaryLoading}
          description={
            topLounge
              ? `${topLounge.entryCount} entries recorded`
              : 'No entry activity yet'
          }
        />
      </div> */}

      {/* Data Table with Lounge Filter and Search */}
      <DataTable
        data={data?.items ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMsg}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search guests by name, email, or phone..."
        onPageChange={setPage}
        onRowClick={(row) => setSelectedEntry(row)}
        emptyTitle="No guestbook entries found"
        emptyDescription={
          search || loungeFilter !== 'all'
            ? 'Try adjusting your search query or lounge filter.'
            : 'No guestbook entries have been recorded yet.'
        }
        toolbar={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={loungeFilter}
              onValueChange={(val) => {
                setLoungeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-60 h-9 bg-card">
                <SelectValue placeholder="All Lounges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lounges ({totalEntries})</SelectItem>
                {summary?.map((item) => (
                  <SelectItem key={item.loungeId} value={item.loungeId}>
                    {item.loungeName} ({item.entryCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Guestbook Entry Detail Dialog */}
      <Dialog
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {selectedEntry && (
            <div>
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#000066]/10 via-[#000066]/5 to-transparent p-6 pb-4 border-b">
                <DialogHeader className="space-y-0 text-left">
                  <DialogTitle className="sr-only">Guest Details</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background shadow-sm shrink-0">
                    <AvatarImage
                      src={getPhotoUrl(selectedEntry.photo)}
                      alt={selectedEntry.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                      {getInitials(selectedEntry.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {selectedEntry.fullName ||
                        `${selectedEntry.firstName} ${selectedEntry.lastName}`.trim()}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      {selectedEntry.email || '—'}
                    </p>
                    {selectedEntry.phoneNumber && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <Phone className="h-3 w-3 shrink-0" />
                        {selectedEntry.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      Lounge
                    </span>
                    <p className="text-sm font-semibold truncate text-foreground">
                      {selectedEntry.loungeId?.name || '—'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Cake className="h-3.5 w-3.5 text-amber-500" />
                      Birth Month
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatBirthMonth(selectedEntry.birthMonth)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border col-span-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Added to Guestbook
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(selectedEntry.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Special Dates Section */}
                {selectedEntry.specialDates && selectedEntry.specialDates.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-rose-500" />
                      <h4 className="font-semibold text-sm text-foreground">
                        Special Dates & Anniversaries
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {selectedEntry.specialDates.map((sd, idx) => (
                        <div
                          key={sd._id || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-xs"
                        >
                          <span className="font-semibold text-rose-900 dark:text-rose-300">
                            {sd.title}
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {formatDate(sd.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-2 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      setEntryToDelete(selectedEntry);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Guestbook Entry
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
        title="Delete Guestbook Entry"
        description={`Are you sure you want to permanently delete the guestbook entry for "${
          entryToDelete?.fullName ||
          `${entryToDelete?.firstName} ${entryToDelete?.lastName}`.trim() ||
          'this guest'
        }"? This action cannot be undone.`}
        confirmLabel="Delete Entry"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

