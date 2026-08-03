import { API } from './axios';
import type { ApiResponse } from '@/types/common';
import type {
  DashboardOverview,
  RecentActivity,
  TimeSeries,
  TimeSeriesInterval,
} from '@/types/dashboard';

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await API.get<ApiResponse<DashboardOverview>>(
    '/admin/dashboard/overview'
  );
  return response.data.data;
};

export const getRecentActivity = async (): Promise<RecentActivity> => {
  const response = await API.get<ApiResponse<RecentActivity>>(
    '/admin/dashboard/recent-activity'
  );
  return response.data.data;
};

export const getTimeSeries = async (
  interval: TimeSeriesInterval = 'daily'
): Promise<TimeSeries> => {
  const response = await API.get<ApiResponse<TimeSeries>>(
    '/admin/dashboard/time-series',
    { params: { interval } }
  );
  return response.data.data;
};
