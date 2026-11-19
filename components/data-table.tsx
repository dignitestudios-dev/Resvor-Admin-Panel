'use client';

import React, { useCallback, useRef, useEffect } from 'react';
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
import { Search, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { TableSkeleton } from '@/components/table-skeleton';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';
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

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalSearch(searchValue ?? '');
  }, [searchValue]);

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

  const handleClear = useCallback(() => {
    setLocalSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearchChange?.('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Records range calculations
  const totalItems = pagination?.totalItems ?? data.length;
  const currentPage = pagination?.currentPage ?? 1;
  const itemsPerPage = pagination?.itemsPerPage ?? (data.length || 10);
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pageNumbers = React.useMemo(() => {
    return getPageNumbers(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const startRecord = totalItems === 0 || data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecord =
    totalItems === 0 || data.length === 0
      ? 0
      : Math.min((currentPage - 1) * itemsPerPage + data.length, totalItems);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {onSearchChange && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && localSearch) {
                  e.preventDefault();
                  handleClear();
                }
              }}
              className="pl-9 pr-9"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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

      {/* Pagination & Total Count Footer */}
      {(pagination || data.length > 0 || isLoading) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground pt-2">
          <div className="text-sm font-medium text-muted-foreground order-2 sm:order-1">
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading records...
              </span>
            ) : totalItems === 0 || data.length === 0 ? (
              <span>Showing 0 of 0 records</span>
            ) : (
              <span>
                Showing <strong className="text-foreground">{startRecord}</strong>–<strong className="text-foreground">{endRecord}</strong> of{' '}
                <strong className="text-foreground">{totalItems}</strong> records
              </span>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-2.5 text-xs font-medium cursor-pointer"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {pageNumbers.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-muted-foreground select-none"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === currentPage ? 'default' : 'outline'}
                      className={cn(
                        'h-8 min-w-8 px-2.5 text-xs font-medium cursor-pointer',
                        p === currentPage &&
                          'bg-[#000066] text-white hover:bg-[#000044] font-semibold'
                      )}
                      onClick={() => onPageChange?.(p)}
                      disabled={isLoading}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>

              <span className="sm:hidden text-xs text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-2.5 text-xs font-medium cursor-pointer"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
