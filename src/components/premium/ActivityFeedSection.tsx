"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import { useAdminPagination } from "@/src/components/admin/useAdminPagination";
import {
  fetchAdminActivityFeed,
  fetchMyActivityFeed,
  fetchVendorActivityFeed,
  type ActivityFeedItem,
} from "@/src/lib/api/premiumSaas";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { glassCard } from "@/src/lib/ui";

type ActivityFeedSectionProps = {
  role: "customer" | "vendor" | "admin";
  /** Admin dashboard only — paginate long activity lists. */
  paginate?: boolean;
};

function useActivityFeedFetcher(role: ActivityFeedSectionProps["role"]) {
  return useCallback(async (): Promise<ActivityFeedItem[]> => {
    if (role === "customer") return fetchMyActivityFeed();
    if (role === "vendor") return fetchVendorActivityFeed();
    return fetchAdminActivityFeed();
  }, [role]);
}

function filterActivity(item: ActivityFeedItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [item.title, item.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function ActivityFeedSection({ role, paginate = false }: ActivityFeedSectionProps) {
  const fetcher = useActivityFeedFetcher(role);
  const { data, loading, error, reload } = useVendorSectionLoad(fetcher);
  const items = data ?? [];

  const pagination = useAdminPagination(items, {
    filterFn: filterActivity,
  });
  const visibleItems = paginate ? pagination.pageItems : items;

  return (
    <VendorSectionState
      loading={loading}
      error={error}
      onRetry={reload}
      isEmpty={!loading && !error && items.length === 0}
      empty={<p className="text-sm text-zinc-500">Henüz kayıt yok.</p>}
    >
      {paginate ? (
        <AdminPaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          searchQuery={pagination.searchQuery}
          onSearchChange={pagination.setSearchQuery}
          searchPlaceholder="Aktivite ara..."
        />
      ) : null}
      {paginate && visibleItems.length === 0 && items.length > 0 ? (
        <p className="text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
      ) : (
      <ul className="space-y-3">
        {visibleItems.map((item, i) => (
          <li
            key={String(item.id ?? i)}
            className={`${glassCard} flex gap-3 py-4 !shadow-none`}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-sm"
              aria-hidden
            >
              {item.icon ?? "◆"}
            </span>
            <div className="min-w-0 flex-1">
              {item.url ? (
                <Link
                  href={item.url}
                  className="font-medium text-white hover:text-violet-200"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="font-medium text-white">{item.title}</p>
              )}
              {item.description ? (
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {item.description}
                </p>
              ) : null}
              {item.createdAt ? (
                <p className="mt-1 text-[10px] text-zinc-600">
                  {formatRelativeTime(item.createdAt)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      )}
    </VendorSectionState>
  );
}
