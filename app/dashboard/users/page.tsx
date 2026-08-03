'use client';

import { useState } from 'react';
import { useUsers, useSuspendUser, useActivateUser, useUser } from '@/hooks/use-users';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreVertical, ShieldOff, ShieldCheck, Users, Info, Music, Compass, Star, Calendar } from 'lucide-react';
import type { User } from '@/types/user';

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

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState<string>('all');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'suspend' | 'activate'>('suspend');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null);

  const handleViewDetails = (userId: string) => {
    setDetailsUserId(userId);
    setDetailsOpen(true);
  };

  const params = {
    page,
    limit: 10,
    search: search || undefined,
    isSuspended:
      suspendedFilter === 'suspended'
        ? true
        : suspendedFilter === 'active'
        ? false
        : undefined,
  };

  const { data, isLoading, isError, error } = useUsers(params);
  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();

  const handleAction = (user: User, act: 'suspend' | 'activate') => {
    setSelectedUser(user);
    setAction(act);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;
    if (action === 'suspend') {
      await suspendMutation.mutateAsync(selectedUser._id);
    } else {
      await activateMutation.mutateAsync(selectedUser._id);
    }
    setConfirmOpen(false);
    setSelectedUser(null);
  };

  const isActionLoading = suspendMutation.isPending || activateMutation.isPending;

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (row) => {
        const name = (row.fullName ?? [row.firstName, row.lastName].filter(Boolean).join(' ')) || '—';
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => (
        <span className="text-sm">{row.phoneNumber ?? '—'}</span>
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
      key: 'subscription',
      header: 'Subscription',
      cell: (row) => (
        <span className="text-sm capitalize">
          {row.subscription?.plan ?? '—'}
        </span>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(row._id);
              }}
            >
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
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
      ?.message ?? 'Failed to load users';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" /> User Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all customer accounts
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
        searchPlaceholder="Search users..."
        onPageChange={setPage}
        onRowClick={(row) => handleViewDetails(row._id)}
        emptyTitle="No users found"
        emptyDescription="No user accounts match your current filters."
        toolbar={
          <Select
            value={suspendedFilter}
            onValueChange={(v) => {
              setSuspendedFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={action === 'suspend' ? 'Suspend User' : 'Activate User'}
        description={
          action === 'suspend'
            ? `Are you sure you want to suspend ${selectedUser?.fullName}? They will lose access immediately.`
            : `Are you sure you want to activate ${selectedUser?.fullName}? They will regain full access.`
        }
        confirmLabel={action === 'suspend' ? 'Suspend' : 'Activate'}
        variant={action === 'suspend' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
        isLoading={isActionLoading}
      />

      <UserDetailsModal
        userId={detailsUserId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

function UserDetailsModal({
  userId,
  open,
  onOpenChange,
}: {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: user, isLoading, isError } = useUser(userId ?? '');

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Profile Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-24 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : isError || !user ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Failed to load user details.
          </p>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg bg-blue-100 text-blue-700 font-bold">
                  {getInitials(
                    user.fullName ??
                      [user.firstName, user.lastName].filter(Boolean).join(' ')
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {(user.fullName ??
                    [user.firstName, user.lastName].filter(Boolean).join(' ')) ||
                    '—'}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <StatusBadge status={user.isSuspended ? 'suspended' : 'active'} />
                  <StatusBadge
                    status={user.isEmailVerified ? 'verified' : 'unverified'}
                  />
                  {user.isSubscribed && (
                    <StatusBadge
                      status="subscribed"
                      className="bg-indigo-100 text-indigo-800"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Profile fields info */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">
                  Phone Number
                </span>
                <span>{user.phoneNumber ?? '—'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">
                  Stripe Customer ID
                </span>
                <span
                  className="font-mono text-xs truncate block max-w-40"
                  title={user.stripeCustomerId ?? ''}
                >
                  {user.stripeCustomerId ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">
                  Joined On
                </span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">
                  Onboarding Step
                </span>
                <span className="capitalize">
                  {user.onboardingStep?.replace('_', ' ') ?? '—'}
                </span>
              </div>
            </div>

            {/* Preferences */}
            {user.preferences && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Compass className="h-4 w-4 text-muted-foreground" /> Personal
                  Preferences
                </h4>
                <div className="space-y-2.5">
                  {user.preferences.musicGenres &&
                    user.preferences.musicGenres.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">
                          Music Genres
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {user.preferences.musicGenres.map((g) => (
                            <span
                              key={g}
                              className="text-xs bg-muted px-2 py-0.5 rounded font-medium"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {user.preferences.loungeTypes &&
                    user.preferences.loungeTypes.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">
                          Lounge Types
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {user.preferences.loungeTypes.map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-muted px-2 py-0.5 rounded font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {user.preferences.preferredExperiences &&
                    user.preferences.preferredExperiences.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">
                          Preferred Experiences
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {user.preferences.preferredExperiences.map((e) => (
                            <span
                              key={e}
                              className="text-xs bg-muted px-2 py-0.5 rounded font-medium"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Special Dates */}
            {user.specialDates && user.specialDates.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Special
                  Dates
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {user.specialDates.map((sd) => (
                    <div
                      key={sd._id ?? sd.occasion}
                      className="border rounded-lg p-2 bg-muted/20"
                    >
                      <span className="text-xs text-muted-foreground block uppercase font-medium">
                        {sd.occasion}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatDate(sd.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
