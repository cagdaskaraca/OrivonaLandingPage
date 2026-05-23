"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { AppNotification } from "@/src/lib/api/types";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { btnSecondary } from "@/src/lib/ui";

export function NotificationsPanel() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchNotifications());
    } catch (err) {
      logApiError("Notifications fetch failed", err);
      setError(formatUiErrorMessage(err, "Bildirimler yüklenemedi."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id: string | number) {
    try {
      await markNotificationRead(id);
      await load();
    } catch (err) {
      logApiError("Mark notification read", err);
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      await load();
    } catch (err) {
      logApiError("Mark all notifications read", err);
    } finally {
      setMarkingAll(false);
    }
  }

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <>
      {unread > 0 ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className={`${btnSecondary} text-xs`}
            disabled={markingAll}
            onClick={() => void handleMarkAll()}
          >
            {markingAll ? "…" : "Tümünü okundu işaretle"}
          </button>
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : error ? (
        <p className="text-sm text-red-300/90">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">Bildirim yok.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={String(n.id ?? n.createdAt)}
              className={`rounded-xl border px-4 py-3 text-sm ${
                n.isRead
                  ? "border-white/10 bg-white/[0.02] text-zinc-400"
                  : "border-violet-400/25 bg-violet-500/[0.08] text-zinc-100"
              }`}
            >
              <p className="font-medium text-white">{n.title ?? "Bildirim"}</p>
              {n.message ? (
                <p className="mt-1 text-zinc-400">{n.message}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {n.createdAt ? (
                  <span className="text-[11px] text-zinc-500">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                ) : null}
                {!n.isRead && n.id != null ? (
                  <button
                    type="button"
                    className="text-xs text-violet-300 hover:text-violet-200"
                    onClick={() => void handleMarkRead(n.id!)}
                  >
                    Okundu
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
