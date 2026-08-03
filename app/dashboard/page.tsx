'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Wine,
  CalendarCheck,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { StatCardsSkeleton } from '@/components/table-skeleton';
import { useDashboardOverview, useRecentActivity, useTimeSeries } from '@/hooks/use-dashboard';
import type { TimeSeriesInterval } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { TableSkeleton } from '@/components/table-skeleton';

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
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function DashboardPage() {
  const [interval, setInterval] = useState<TimeSeriesInterval>('daily');

  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: timeSeries, isLoading: chartLoading } = useTimeSeries(interval);

  const intervals: { value: TimeSeriesInterval; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Resvor platform activity
        </p>
      </div>

      {/* Stats Cards */}
      {overviewLoading ? (
        <StatCardsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Lounges"
            value={overview?.totalLounges}
            icon={Building2}
            iconColor="text-violet-600"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
          />
          <StatCard
            title="Total Users"
            value={overview?.totalUsers}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="Bartenders"
            value={overview?.totalBartenders}
            icon={Wine}
            iconColor="text-amber-600"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            title="Total Bookings"
            value={overview?.totalBookings}
            icon={CalendarCheck}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            title="Pending Bookings"
            value={overview?.pendingBookings}
            icon={Clock}
            iconColor="text-orange-600"
            iconBg="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            title="Upcoming Events"
            value={overview?.upcomingEvents}
            icon={CalendarDays}
            iconColor="text-pink-600"
            iconBg="bg-pink-100 dark:bg-pink-900/30"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base">Bookings</CardTitle>
              <CardDescription>Booking volume over time</CardDescription>
            </div>
            <div className="flex gap-1">
              {intervals.map((i) => (
                <Button
                  key={i.value}
                  size="sm"
                  variant={interval === i.value ? 'default' : 'ghost'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setInterval(i.value)}
                >
                  {i.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (timeSeries?.bookingTimeSeries?.length ?? 0) === 0 ? (
              <EmptyState
                title="No chart data"
                description="No booking data for this period."
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeSeries?.bookingTimeSeries ?? []}>
                  <defs>
                    <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) => `Period: ${v}`}
                    formatter={(v) => [v, 'Bookings']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    fill="url(#bookingGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (timeSeries?.revenueTimeSeries?.length ?? 0) === 0 ? (
              <EmptyState
                title="No chart data"
                description="No revenue data for this period."
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeSeries?.revenueTimeSeries ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(v) => `Period: ${v}`}
                    formatter={(v) => [`$${(Number(v) / 100).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLoading ? (
              <TableSkeleton rows={5} columns={1} />
            ) : !recentActivity?.recentUsers?.length ? (
              <EmptyState title="No recent users" description="" />
            ) : (
              recentActivity.recentUsers.map((user) => {
                const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
                return (
                  <div key={user._id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLoading ? (
              <TableSkeleton rows={5} columns={1} />
            ) : !recentActivity?.recentBookings?.length ? (
              <EmptyState title="No recent bookings" description="" />
            ) : (
              recentActivity.recentBookings.map((booking) => {
                const userName = [booking.userId?.firstName, booking.userId?.lastName].filter(Boolean).join(' ') || booking.guestName || 'Unknown';
                return (
                  <div key={booking._id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.loungeId?.name ?? '—'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLoading ? (
              <TableSkeleton rows={5} columns={1} />
            ) : !recentActivity?.recentPayments?.length ? (
              <EmptyState title="No recent payments" description="" />
            ) : (
              recentActivity.recentPayments.map((payment) => {
                const ownerName = [payment.ownerId?.firstName, payment.ownerId?.lastName].filter(Boolean).join(' ') || 'Unknown Owner';
                return (
                  <div key={payment._id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.currency?.toUpperCase()} {payment.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={payment.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
