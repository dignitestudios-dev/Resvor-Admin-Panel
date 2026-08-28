'use client';

import { useState } from 'react';
import { useUsers, useSuspendUser, useActivateUser, useUser } from '@/hooks/use-users';
import { DataTable, Column } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  MoreVertical,
  ShieldOff,
  ShieldCheck,
  Users,
  Info,
  Music,
  Building2,
  Sparkles,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  SlidersHorizontal,
  Crown,
  Gift,
  Cake,
} from 'lucide-react';
import type { User } from '@/types/user';
import { cn } from '@/lib/utils';

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function getProfileImageUrl(user?: User | null): string | undefined {
  if (!user) return undefined;
  if (typeof user.profilePicture === 'string' && user.profilePicture.trim()) {
    return user.profilePicture;
  }
  if (user.profilePicture && typeof user.profilePicture === 'object') {
    const pic = user.profilePicture as {
      url?: string;
      secure_url?: string;
      path?: string;
      location?: string;
      fileUrl?: string;
    };
    if (pic.url) return pic.url;
    if (pic.secure_url) return pic.secure_url;
    if (pic.location) return pic.location;
    if (pic.path) return pic.path;
    if (pic.fileUrl) return pic.fileUrl;
  }
  if (typeof user.profileImage === 'string' && user.profileImage.trim()) {
    return user.profileImage;
  }
  return undefined;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getUserType(user?: User | null): 'Lounge Manager' | 'User' {
  if (!user) return 'User';
  if (
    user.userType === 'LoungeManager' ||
    user.userType === 'lounge_manager' ||
    user.role === 'LoungeManager' ||
    user.role === 'lounge_manager' ||
    user.role === 'manager' ||
    user.isLoungeManager ||
    Boolean(user.loungeId)
  ) {
    return 'Lounge Manager';
  }
  return 'User';
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
        const imgUrl = getProfileImageUrl(row);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border shrink-0">
              {imgUrl && <AvatarImage src={imgUrl} alt={name} className="object-cover" />}
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'userType',
      header: 'User Type',
      cell: (row) => {
        const type = getUserType(row);
        const isManager = type === 'Lounge Manager';
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs whitespace-nowrap',
              isManager
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
            )}
          >
            {isManager ? (
              <Building2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            ) : (
              <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            )}
            <span>{type}</span>
          </span>
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
          {row.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
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

  const displayName =
    (user?.fullName ??
      [user?.firstName, user?.lastName].filter(Boolean).join(' ')) ||
    user?.email?.split('@')[0] ||
    'User';

  const imgUrl = getProfileImageUrl(user);

  const hasPreferences =
    user?.preferences &&
    ((user.preferences.musicGenres && user.preferences.musicGenres.length > 0) ||
      (user.preferences.loungeTypes && user.preferences.loungeTypes.length > 0) ||
      (user.preferences.preferredExperiences &&
        user.preferences.preferredExperiences.length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-bold">User Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-6 pt-2">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-36 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-28 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
              <div className="h-16 bg-muted animate-pulse rounded-xl" />
            </div>
            <div className="h-28 bg-muted animate-pulse rounded-xl" />
          </div>
        ) : isError || !user ? (
          <div className="p-6 text-center py-10">
            <p className="text-sm text-muted-foreground">
              Failed to load user details.
            </p>
          </div>
        ) : (
          <div className="space-y-5 p-6 pt-2 max-h-[80vh] overflow-y-auto">
            {/* Header / Hero Profile Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/40 border">
              <Avatar className="h-16 w-16 border-2 border-background shadow-sm shrink-0">
                {imgUrl && (
                  <AvatarImage
                    src={imgUrl}
                    alt={displayName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-foreground truncate">
                    {displayName}
                  </h3>
                  <StatusBadge
                    status={user.isSuspended ? 'suspended' : 'active'}
                  />
                </div>

                <div className="space-y-0.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span>{user.email}</span>
                  </p>
                  {user.phoneNumber && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span>{user.phoneNumber}</span>
                    </p>
                  )}
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs',
                      getUserType(user) === 'Lounge Manager'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                    )}
                  >
                    {getUserType(user) === 'Lounge Manager' ? (
                      <Building2 className="h-3 w-3" />
                    ) : (
                      <Users className="h-3 w-3" />
                    )}
                    {getUserType(user)}
                  </span>
                  {user.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Email Verified
                    </span>
                  )}
                  {user.isPhoneNumberVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                      <CheckCircle2 className="h-3 w-3" /> Phone Verified
                    </span>
                  )}
                  {user.isSubscribed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                      <Crown className="h-3 w-3 text-amber-600" /> Member
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Relevant Account Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Joined Date
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate block">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Onboarding
                  </span>
                  <span className="text-xs font-semibold text-foreground capitalize truncate block">
                    {user.onboardingStep?.replace('_', ' ') || (user.isProfileCompleted ? 'Completed' : 'Pending')}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Preferences with Styled Pills */}
            {hasPreferences && (
              <div className="space-y-3 pt-1 border-t">
                <div className="flex items-center gap-2 pt-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm text-foreground">
                    Personal Preferences
                  </h4>
                </div>

                <div className="space-y-3">
                  {user.preferences?.musicGenres &&
                    user.preferences.musicGenres.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Music className="h-3.5 w-3.5 text-violet-500" />
                          Music Genres
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferences.musicGenres.map((g) => (
                            <span
                              key={g}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {user.preferences?.loungeTypes &&
                    user.preferences.loungeTypes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-teal-500" />
                          Lounge Types
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferences.loungeTypes.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {user.preferences?.preferredExperiences &&
                    user.preferences.preferredExperiences.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Preferred Experiences
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {user.preferences.preferredExperiences.map((e) => (
                            <span
                              key={e}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
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
              <div className="space-y-3 pt-1 border-t">
                <div className="flex items-center gap-2 pt-2">
                  <Gift className="h-4 w-4 text-rose-500" />
                  <h4 className="font-semibold text-sm text-foreground">
                    Special Occasions
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {user.specialDates.map((sd) => (
                    <div
                      key={sd._id ?? sd.occasion}
                      className="flex items-center gap-3 p-2.5 rounded-xl border bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                    >
                      <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <Cake className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wide block truncate">
                          {sd.occasion === 'DOB' ? 'Date of Birth' : sd.occasion}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {formatDate(sd.date)}
                        </span>
                      </div>
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
