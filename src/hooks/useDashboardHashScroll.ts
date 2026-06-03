"use client";

import { useEffect, useRef } from "react";
import { consumeObotFocusTarget } from "@/src/lib/obot/obotRedirect";
import {
  consumePendingHashScroll,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";

type UseDashboardHashScrollOptions = {
  /** When true, hash scroll is deferred until loading finishes. */
  isLoading?: boolean;
};

function hashFromLocation(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash;
}

/** Scrolls to #section when landing on dashboard; retries until layout is ready. */
export function useDashboardHashScroll(options?: UseDashboardHashScrollOptions) {
  const cancelRef = useRef<(() => void) | null>(null);
  const isLoading = options?.isLoading ?? false;
  const wasLoadingRef = useRef(isLoading);

  const scheduleFocusTarget = () => {
    const focusId = consumeObotFocusTarget();
    if (!focusId) return;
    cancelRef.current?.();
    cancelRef.current = scrollToHashWhenReady(`#${focusId}`, {
      highlight: true,
      forceSameHash: true,
      updateHash: false,
      immediate: true,
    });
  };

  const scheduleScroll = (hash: string, highlight: boolean) => {
    if (!hash) {
      scheduleFocusTarget();
      return;
    }
    cancelRef.current?.();
    cancelRef.current = scrollToHashWhenReady(hash, {
      highlight,
      forceSameHash: true,
      updateHash: true,
      immediate: true,
    });
    window.setTimeout(scheduleFocusTarget, 500);
  };

  useEffect(() => {
    const pending = consumePendingHashScroll();
    const hash = pending ? `#${pending}` : hashFromLocation();
    scheduleScroll(hash, false);

    const onHashChange = () => scheduleScroll(hashFromLocation(), false);
    const onLayoutReady = () => scheduleScroll(hashFromLocation(), false);

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("orivona-dashboard-layout-ready", onLayoutReady);

    return () => {
      cancelRef.current?.();
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("orivona-dashboard-layout-ready", onLayoutReady);
    };
  }, []);

  useEffect(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = isLoading;

    if (wasLoading && !isLoading) {
      scheduleScroll(hashFromLocation(), false);
    }
  }, [isLoading]);
}
