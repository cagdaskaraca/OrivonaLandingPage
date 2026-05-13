"use client";

import { GA_MEASUREMENT_ID } from "@/src/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sends GA4 `page_view` on client-side route changes. Initial load is handled
 * by the inline gtag bootstrap in `layout.tsx` (with `send_page_view: true`).
 */
export function GoogleAnalyticsRouteListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const gtag = window.gtag;
    if (typeof gtag !== "function") return;

    gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}
