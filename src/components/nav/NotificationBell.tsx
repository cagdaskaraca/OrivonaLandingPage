"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { markAllNotificationsRead } from "@/src/lib/api";
import { useBellNotifications } from "@/src/hooks/useBellNotifications";
import { useNotificationAction } from "@/src/lib/useNotificationAction";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { AppNotification } from "@/src/lib/api/types";
import { isSyntheticNotification } from "@/src/lib/notificationMessages";
import { formatRelativeTime } from "@/src/lib/relativeTime";
import { btnSecondary } from "@/src/lib/ui";

type NotificationBellProps = {
  variant?: "landing" | "demo";
};

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationBell({ variant = "demo" }: NotificationBellProps) {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const { items, badgeCount, loading, reload } = useBellNotifications({
    enabled: isAuthenticated && !authLoading,
  });

  const { handleNotificationClick } = useNotificationAction({
    onAfterNavigate: () => setOpen(false),
    onMarkReadError: (msg) => setError(msg),
  });

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    void reload();
  }, [open, isAuthenticated, reload]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function onNotificationClick(notification: AppNotification) {
    const id = notification.id;
    const synthetic = isSyntheticNotification(notification);
    setMarkingId(id ?? null);
    setError(null);
    try {
      await handleNotificationClick(notification);
      await reload();
    } catch {
      setError("Bildirim işlenemedi.");
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (badgeCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      await reload();
    } catch (err) {
      logApiError("Mark all notifications read failed", err);
      setError(
        formatUiErrorMessage(
          err,
          "Bildirimler okundu olarak işaretlenemedi.",
        ),
      );
    } finally {
      setMarkingAll(false);
    }
  }

  if (authLoading || !isAuthenticated) return null;

  const triggerClass =
    variant === "landing"
      ? "relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-[color,box-shadow,border-color] hover:border-violet-400/30 hover:text-white hover:shadow-[0_0_18px_rgba(167,139,250,0.25)]"
      : "relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition-[color,box-shadow,border-color] hover:border-violet-400/30 hover:text-violet-100 hover:shadow-[0_0_18px_rgba(167,139,250,0.2)]";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClass}
        aria-label={
          badgeCount > 0
            ? `Bildirimler, ${badgeCount} okunmamış`
            : "Bildirimler"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="h-[1.15rem] w-[1.15rem]" />
        {badgeCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-[#0a0612] shadow-[0_0_12px_rgba(192,132,252,0.65)]">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Bildirimler"
          className="absolute right-0 z-[60] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-violet-200/10 bg-[#0c0814]/95 shadow-[0_24px_64px_-16px_rgba(24,12,48,0.9)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Bildirimler</p>
            <button
              type="button"
              className="text-xs font-medium text-violet-200/90 transition-colors hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={markingAll || badgeCount === 0 || loading}
              onClick={() => void handleMarkAllRead()}
            >
              Tümünü okundu işaretle
            </button>
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="space-y-0 divide-y divide-white/[0.06]">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse px-4 py-3.5">
                    <div className="h-3.5 w-2/3 rounded bg-white/[0.08]" />
                    <div className="mt-2 h-3 w-full rounded bg-white/[0.05]" />
                    <div className="mt-2 h-2.5 w-1/4 rounded bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            ) : error && items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-red-300/90">{error}</p>
                <button
                  type="button"
                  className={`${btnSecondary} mt-4 px-4 py-2 text-xs`}
                  onClick={() => void reload()}
                >
                  Tekrar dene
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-zinc-200">
                  Bildirim yok
                </p>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Yeni bildirimler burada görünecek.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {items.map((notification) => {
                  const id = notification.id ?? notification.title;
                  const isUnread = !notification.isRead;
                  const isMarking = markingId === notification.id;
                  const hasLink = Boolean(notification.actionUrl?.trim());
                  return (
                    <li key={String(id)}>
                      <button
                        type="button"
                        disabled={isMarking}
                        className={`w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-60 ${
                          isUnread
                            ? "bg-violet-500/[0.07]"
                            : "bg-transparent"
                        } ${hasLink ? "cursor-pointer" : ""}`}
                        onClick={() => void onNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2.5">
                          {isUnread ? (
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                              aria-hidden
                            />
                          ) : (
                            <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm ${
                                isUnread
                                  ? "font-semibold text-white"
                                  : "font-medium text-zinc-300"
                              }`}
                            >
                              {notification.title?.trim() || "Bildirim"}
                            </p>
                            {notification.message?.trim() ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                                {notification.message}
                              </p>
                            ) : null}
                            {notification.createdAt ? (
                              <p className="mt-1.5 text-[11px] text-zinc-500">
                                {formatRelativeTime(notification.createdAt)}
                              </p>
                            ) : null}
                            {hasLink ? (
                              <p className="mt-1 text-[11px] font-medium text-violet-300/90">
                                Görüntüle →
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && items.length > 0 ? (
            <p className="border-t border-white/10 px-4 py-2 text-center text-xs text-red-300/80">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
