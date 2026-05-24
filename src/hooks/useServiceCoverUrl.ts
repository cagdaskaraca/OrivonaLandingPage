"use client";

import { useEffect, useState } from "react";
import { fetchServiceMedia } from "@/src/lib/api";
import { getServiceImageUrl } from "@/src/lib/serviceImage";
import type { MarketplaceItem } from "@/src/lib/api/types";

/** Resolves cover from API media when item has no coverImageUrl. */
export function useServiceCoverUrl(item: MarketplaceItem): string {
  const [url, setUrl] = useState(() => getServiceImageUrl(item));
  const serviceId = item.vendorServiceId ?? item.id;

  useEffect(() => {
    setUrl(getServiceImageUrl(item));
    if (
      item.coverImageUrl?.trim() ||
      item.imageUrl?.trim() ||
      serviceId == null
    ) {
      return;
    }
    let cancelled = false;
    void fetchServiceMedia(serviceId).then((list) => {
      if (cancelled) return;
      const cover = list.find((m) => m.isCover) ?? list[0];
      if (cover?.url) setUrl(cover.url);
    });
    return () => {
      cancelled = true;
    };
  }, [item.coverImageUrl, item.imageUrl, serviceId, item]);

  return url;
}
