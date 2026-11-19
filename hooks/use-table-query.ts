'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UseTableQueryOptions<T extends Record<string, any>> {
  defaultValues: T;
}

export function useTableQuery<T extends Record<string, any>>(
  options: UseTableQueryOptions<T>
) {
  const { defaultValues } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current query values from URL search params
  const query = useMemo(() => {
    const values: Record<string, any> = { ...defaultValues };

    // Parse page (must be integer >= 1)
    const pageParam = searchParams.get('page');
    if (pageParam !== null) {
      const parsedPage = parseInt(pageParam, 10);
      values.page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
    } else {
      values.page = defaultValues.page ?? 1;
    }

    // Parse search
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      values.search = searchParam;
    } else {
      values.search = defaultValues.search ?? '';
    }

    // Parse all other custom filter keys
    Object.keys(defaultValues).forEach((key) => {
      if (key === 'page' || key === 'search') return;
      const paramVal = searchParams.get(key);
      if (paramVal !== null) {
        values[key] = paramVal;
      } else {
        values[key] = defaultValues[key];
      }
    });

    return values as T & { page: number; search: string };
  }, [searchParams, defaultValues]);

  // Update URL search parameters
  const updateQuery = useCallback(
    (updates: Partial<T>, opts?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      const shouldResetPage = opts?.resetPage ?? true;

      // When filters or search change, reset page to 1 unless page is explicitly updated
      if (shouldResetPage && !('page' in updates)) {
        params.delete('page');
      }

      Object.entries(updates).forEach(([key, val]) => {
        if (key === 'page') {
          const pageNum = Number(val);
          if (Number.isFinite(pageNum) && pageNum > 1) {
            params.set('page', String(pageNum));
          } else {
            params.delete('page');
          }
        } else if (key === 'search') {
          const searchStr = String(val ?? '').trim();
          if (searchStr) {
            params.set('search', searchStr);
          } else {
            params.delete('search');
          }
        } else {
          // Custom filters: remove if empty, 'all', null, or undefined
          const defaultVal = defaultValues[key];
          if (
            val === undefined ||
            val === null ||
            val === '' ||
            val === 'all' ||
            val === defaultVal
          ) {
            params.delete(key);
          } else {
            params.set(key, String(val));
          }
        }
      });

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(targetUrl, { scroll: false });
    },
    [router, pathname, searchParams, defaultValues]
  );

  const setPage = useCallback(
    (page: number) => {
      updateQuery({ page } as any, { resetPage: false });
    },
    [updateQuery]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateQuery({ search } as any, { resetPage: true });
    },
    [updateQuery]
  );

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      updateQuery({ [key]: value } as any, { resetPage: true });
    },
    [updateQuery]
  );

  const resetAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    query,
    setPage,
    setSearch,
    setFilter,
    updateQuery,
    resetAll,
  };
}

