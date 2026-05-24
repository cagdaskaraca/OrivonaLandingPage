"use client";

import { useEffect, useRef } from "react";
import {
  consumePendingHashScroll,
  scrollToHomeHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";

type UseHomeHashScrollOptions = {
  /** Defer hash scroll until async homepage blocks finish loading. */
  isLoading?: boolean;
};

function hashFromLocation(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash;
}

/** Scrolls to #section on homepage; retries until layout is ready. */
export function useHomeHashScroll(options?: UseHomeHashScrollOptions) {
  const cancelRef = useRef<(() => void) | null>(null);
  const isLoading = options?.isLoading ?? false;
  const wasLoadingRef = useRef(isLoading);

  const scheduleScroll = (hash: string, highlight: boolean) => {
    if (!hash) return;
    cancelRef.current?.();
    cancelRef.current = scrollToHomeHashWhenReady(hash, {
      highlight,
      forceSameHash: true,
      updateHash: true,
    });
  };

  useEffect(() => {
    const pending = consumePendingHashScroll();
    const hash = pending ? `#${pending}` : hashFromLocation();
    scheduleScroll(hash, false);

    const onHashChange = () => scheduleScroll(hashFromLocation(), false);
    const onLayoutReady = () => scheduleScroll(hashFromLocation(), false);

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("orivona-landing-layout-ready", onLayoutReady);

    return () => {
      cancelRef.current?.();
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("orivona-landing-layout-ready", onLayoutReady);
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
