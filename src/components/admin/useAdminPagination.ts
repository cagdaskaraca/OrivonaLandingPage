"use client";

import { useEffect, useMemo, useState } from "react";

export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number];

type UseAdminPaginationOptions<T> = {
  pageSize?: number;
  filterFn?: (item: T, query: string) => boolean;
};

function defaultFilter<T>(item: T, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = JSON.stringify(item).toLowerCase();
  return text.includes(q);
}

export function useAdminPagination<T>(
  items: T[],
  options: UseAdminPaginationOptions<T> = {},
) {
  const { pageSize: initialPageSize = 10, filterFn = defaultFilter } = options;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AdminPageSize>(
    ADMIN_PAGE_SIZE_OPTIONS.includes(initialPageSize as AdminPageSize)
      ? (initialPageSize as AdminPageSize)
      : 10,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) => filterFn(item, searchQuery));
  }, [items, searchQuery, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize, items.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    filteredItems,
    pageItems,
    totalPages,
    totalCount: filteredItems.length,
  };
}
