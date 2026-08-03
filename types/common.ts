// Common API response types used across all Resvor admin endpoints

// Standard single-item response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Actual list API response shape from the Resvor backend:
// { success, message, data: T[], pagination: {...} }
export interface ListApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
}

// Resvor backend pagination fields (actual field names from the API)
export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Normalized shape used inside the app after parsing the list response
export interface NormalizedListResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}
