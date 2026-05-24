"use client";

import Link from "next/link";
import { useCallback } from "react";
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
};

function useActivityFeedFetcher(role: ActivityFeedSectionProps["role"]) {
  return useCallback(async (): Promise<ActivityFeedItem[]> => {
    if (role === "customer") return fetchMyActivityFeed();
    if (role === "vendor") return fetchVendorActivityFeed();
    return fetchAdminActivityFeed();
  }, [role]);
}

export function ActivityFeedSection({ role }: ActivityFeedSectionProps) {
  const fetcher = useActivityFeedFetcher(role);
  const { data, loading, error, reload } = useVendorSectionLoad(fetcher);
  const items = data ?? [];

  return (
    <VendorSectionState
      loading={loading}
      error={error}
      onRetry={reload}
      isEmpty={!loading && !error && items.length === 0}
      empty={<p className="text-sm text-zinc-500">Henüz aktivite yok.</p>}
    >
      <ul className="space-y-3">
        {items.map((item, i) => (
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
    </VendorSectionState>
  );
}
