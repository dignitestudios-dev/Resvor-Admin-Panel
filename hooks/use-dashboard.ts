'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDashboardOverview,
  getRecentActivity,
  getTimeSeries,
} from '@/lib/api/dashboard.api';
import type { TimeSeriesInterval } from '@/types/dashboard';

export const DASHBOARD_KEYS = {
  overview: ['dashboard', 'overview'] as const,
  recentActivity: ['dashboard', 'recent-activity'] as const,
  timeSeries: (interval: TimeSeriesInterval) =>
    ['dashboard', 'time-series', interval] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.overview,
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.recentActivity,
    queryFn: getRecentActivity,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTimeSeries(interval: TimeSeriesInterval = 'daily') {
  return useQuery({
    queryKey: DASHBOARD_KEYS.timeSeries(interval),
    queryFn: () => getTimeSeries(interval),
    staleTime: 1000 * 60 * 5,
  });
}
