"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminActivityFeed,
  fetchMyActivityFeed,
  fetchVendorActivityFeed,
  type ActivityFeedItem,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { glassCard } from "@/src/lib/ui";

type ActivityFeedSectionProps = {
  role: "customer" | "vendor" | "admin";
};

export function ActivityFeedSection({ role }: ActivityFeedSectionProps) {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnavailable(false);
    try {
      const list =
        role === "customer"
          ? await fetchMyActivityFeed()
          : role === "vendor"
            ? await fetchVendorActivityFeed()
            : await fetchAdminActivityFeed();
      setItems(list);
      if (list.length === 0) {
        setUnavailable(false);
      }
    } catch (err) {
      logApiError("Activity feed", err);
      if (isApiNotFound(err)) {
        setUnavailable(true);
        setItems([]);
      } else {
        setError(formatUiErrorMessage(err, "Aktiviteler yüklenemedi."));
      }
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  if (unavailable) {
    return (
      <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>
    );
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Aktiviteler yükleniyor…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300/90">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz aktivite yok.</p>;
  }

  return (
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
  );
}
