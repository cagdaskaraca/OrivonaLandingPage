"use client";

import type { ReactNode } from "react";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import {
  useAdminPagination,
  type AdminPageSize,
} from "@/src/components/admin/useAdminPagination";
import { skeletonClass } from "@/src/lib/ui";

type AdminPaginatedListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string;
  pageSize?: AdminPageSize;
  emptyMessage?: string;
  searchPlaceholder?: string;
  filterItem?: (item: T, query: string) => boolean;
  layout?: "list" | "grid";
  loading?: boolean;
  className?: string;
  listClassName?: string;
};

export function AdminPaginatedList<T>({
  items,
  renderItem,
  getItemKey,
  pageSize = 10,
  emptyMessage = "Henüz kayıt yok.",
  searchPlaceholder,
  filterItem,
  layout = "list",
  loading,
  className,
  listClassName,
}: AdminPaginatedListProps<T>) {
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
    return <p className={`text-sm text-zinc-500 ${className ?? ""}`}>{emptyMessage}</p>;
  }

  const listLayout =
    layout === "grid"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      : "space-y-2";

  return (
    <div className={className}>
      <AdminPaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
      />
      {pageItems.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
      ) : (
        <ul className={`${listLayout} ${listClassName ?? ""}`}>
          {pageItems.map((item, index) => (
            <li key={getItemKey(item)}>{renderItem(item, index)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
