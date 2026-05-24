"use client";

import { useEffect } from "react";
import { scrollToDashboardSection } from "@/src/lib/scrollToDashboardSection";

/** Scrolls to #section when landing on dashboard with hash. */
export function useDashboardHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      scrollToDashboardSection(id, {
        highlight: false,
        updateHash: false,
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
}
