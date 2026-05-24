"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { markNotificationRead } from "@/src/lib/api";
import { logApiError } from "@/src/lib/api/client";
import type { AppNotification } from "@/src/lib/api/types";
import { isSyntheticNotification } from "@/src/lib/notificationMessages";
import { resolveNotificationActionUrl } from "@/src/lib/notificationNavigation";
import {
  navigateToResolvedLink,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";

type UseNotificationActionOptions = {
  onAfterNavigate?: () => void;
  onMarkReadError?: (message: string) => void;
};

export function useNotificationAction(options?: UseNotificationActionOptions) {
  const router = useRouter();

  const handleNotificationClick = useCallback(
    async (notification: AppNotification) => {
      const id = notification.id;

      if (
        id != null &&
        !notification.isRead &&
        !isSyntheticNotification(notification)
      ) {
        try {
          await markNotificationRead(id);
        } catch (err) {
          logApiError("Mark notification read", err);
          options?.onMarkReadError?.(
            "Bildirim okundu işaretlenemedi; yönlendirme devam ediyor.",
          );
        }
      }

      const actionUrl = notification.actionUrl?.trim();
      if (!actionUrl) return;

      const resolved = resolveNotificationActionUrl(
        actionUrl,
        typeof window !== "undefined" ? window.location.origin : undefined,
      );
      if (!resolved) return;

      options?.onAfterNavigate?.();

      const sectionId = resolved.hash.replace(/^#/, "");
      const samePath =
        typeof window !== "undefined" &&
        window.location.pathname.replace(/\/$/, "") ===
          resolved.pathname.replace(/\/$/, "");

      navigateToResolvedLink(router, resolved);

      if (!samePath && sectionId) {
        window.setTimeout(() => {
          scrollToHashWhenReady(resolved.hash, {
            highlight: true,
            forceSameHash: true,
            updateHash: true,
          });
        }, 50);
      }
    },
    [router, options],
  );

  return { handleNotificationClick };
}
