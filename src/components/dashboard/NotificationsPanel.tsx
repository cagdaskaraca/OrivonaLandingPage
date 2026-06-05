"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { AppNotification } from "@/src/lib/api/types";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { useNotificationAction } from "@/src/lib/useNotificationAction";
import { SmartNotificationsButton } from "@/src/components/premium/SmartNotificationsButton";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import { useAdminPagination } from "@/src/components/admin/useAdminPagination";
import { btnSecondary } from "@/src/lib/ui";

type NotificationsPanelProps = {
  /** 5’li sayfalama + arama (admin / işletme). */
  paginate?: boolean;
  searchPlaceholder?: string;
};

function filterNotification(n: AppNotification, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [n.title, n.message].filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q);
}

export function NotificationsPanel({
  paginate = false,
  searchPlaceholder = "Bildirim ara...",
}: NotificationsPanelProps = {}) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [actingId, setActingId] = useState<string | number | null>(null);

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

  const { handleNotificationClick } = useNotificationAction({
    onMarkReadError: (msg) => setError(msg),
  });

  useEffect(() => {
    load();
  }, [load]);

  async function onItemClick(notification: AppNotification) {
    const id = notification.id;
    setActingId(id ?? null);
    try {
      await handleNotificationClick(notification);
      if (!notification.actionUrl?.trim()) {
        await load();
      } else {
        setItems((list) =>
          list.map((n) =>
            n.id === id && id != null
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n,
          ),
        );
      }
    } finally {
      setActingId(null);
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

  const pagination = useAdminPagination(items, {
    filterFn: filterNotification,
  });

  const visibleItems = paginate ? pagination.pageItems : items;

  function renderNotificationRow(n: AppNotification) {
    const hasLink = Boolean(n.actionUrl?.trim());
    const busy = actingId === n.id;
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void onItemClick(n)}
        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:border-violet-400/30 disabled:opacity-60 ${
          n.isRead
            ? "border-white/10 bg-white/[0.02] text-zinc-400"
            : "border-violet-400/25 bg-violet-500/[0.08] text-zinc-100"
        }`}
      >
        <p className="font-medium text-white">{n.title ?? "Bildirim"}</p>
        {n.message ? <p className="mt-1 text-zinc-400">{n.message}</p> : null}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {n.createdAt ? (
            <span className="text-[11px] text-zinc-500">
              {formatRelativeTime(n.createdAt)}
            </span>
          ) : (
            <span />
          )}
          {hasLink ? (
            <span className="text-[11px] font-medium text-violet-300">
              Görüntüle →
            </span>
          ) : !n.isRead ? (
            <span className="text-[11px] text-zinc-500">Okundu işaretle</span>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <>
      <SmartNotificationsButton onGenerated={() => void load()} />
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
        <p className="text-sm text-zinc-500">Henüz kayıt yok.</p>
      ) : (
        <>
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
              searchPlaceholder={searchPlaceholder}
            />
          ) : null}
          {paginate && visibleItems.length === 0 ? (
            <p className="text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
          ) : (
            <ul className="space-y-2">
              {visibleItems.map((n) => (
                <li key={String(n.id ?? n.createdAt)}>
                  {renderNotificationRow(n)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
