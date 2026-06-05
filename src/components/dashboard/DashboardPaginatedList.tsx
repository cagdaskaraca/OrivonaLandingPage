"use client";

import type { ReactNode } from "react";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import {
  ADMIN_DEFAULT_PAGE_SIZE,
  useAdminPagination,
  type AdminPageSize,
} from "@/src/components/admin/useAdminPagination";
import { skeletonClass } from "@/src/lib/ui";

type DashboardPaginatedListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string;
  pageSize?: AdminPageSize;
  emptyMessage?: string;
  searchPlaceholder?: string;
  filterItem?: (item: T, query: string) => boolean;
  loading?: boolean;
  className?: string;
  listClassName?: string;
};

/** Müşteri / işletme panelleri — admin ile aynı 5’li sayfalama (Önceki / Sonraki). */
export function DashboardPaginatedList<T>({
  items,
  renderItem,
  getItemKey,
  pageSize = ADMIN_DEFAULT_PAGE_SIZE,
  emptyMessage = "Henüz kayıt yok.",
  searchPlaceholder,
  filterItem,
  loading,
  className,
  listClassName = "space-y-3",
}: DashboardPaginatedListProps<T>) {
  const {
    page,
    setPage,
    pageSize: size,
    setPageSize,
    searchQuery,
    setSearchQuery,
    pageItems,
    totalPages,
    totalCount,
  } = useAdminPagination(items, { pageSize, filterFn: filterItem });

  if (loading) {
    return <div className={`${skeletonClass} h-32 ${className ?? ""}`} />;
  }

  if (items.length === 0) {
    return emptyMessage ? (
      <p className={`text-sm text-zinc-500 ${className ?? ""}`}>{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className={className ? `space-y-3 ${className}` : "space-y-3"}>
      <AdminPaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={searchPlaceholder ? setSearchQuery : undefined}
        searchPlaceholder={searchPlaceholder}
      />
      {pageItems.length === 0 ? (
        <p className="text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
      ) : (
        <ul className={listClassName}>
          {pageItems.map((item, index) => (
            <li key={getItemKey(item)}>{renderItem(item, index)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
