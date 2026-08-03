'use client';

import React, { useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { TableSkeleton } from '@/components/table-skeleton';
import { EmptyState } from '@/components/empty-state';
import type { Pagination } from '@/types/common';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: Pagination;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { _id?: string; id?: string | number }>({
  data,
  columns,
  pagination,
  isLoading = false,
  isError = false,
  errorMessage,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onPageChange,
  onRowClick,
  toolbar,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = React.useState(searchValue ?? '');
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 500);
    },
    [onSearchChange]
  );

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {onSearchChange && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={col.className}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-6">
                    <TableSkeleton rows={6} columns={columns.length} />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      title="Failed to load data"
                      description={errorMessage || 'Something went wrong.'}
                      icon={<Loader2 className="h-8 w-8 text-destructive" />}
                    />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, idx) => (
                  <TableRow
                    key={row._id ?? row.id ?? idx}
                    onClick={() => onRowClick?.(row)}
                    className={
                      onRowClick
                        ? 'cursor-pointer hover:bg-muted/50 transition-colors'
                        : 'hover:bg-muted/30 transition-colors'
                    }
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.currentPage} of {pagination.totalPages} &bull;{' '}
            {pagination.totalItems} total records
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
