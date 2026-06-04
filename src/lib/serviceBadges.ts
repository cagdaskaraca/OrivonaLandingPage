import type { MarketplaceItem } from "@/src/lib/api/types";
import { fetchServiceBadges } from "@/src/lib/api/premiumSaas";

/** Dedupe badge codes (case-insensitive). */
export function mergeBadgeLists(
  ...lists: (string[] | undefined)[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list ?? []) {
      const b = raw.trim();
      if (!b) continue;
      const key = b.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(b);
    }
  }
  return out;
}

function serviceIdOf(item: MarketplaceItem): string | number | undefined {
  return item.vendorServiceId ?? item.id;
}

/** Fills missing `badges` on marketplace rows via GET /services/{id}/badges. */
export async function enrichMarketplaceItemsWithBadges(
  items: MarketplaceItem[],
  options?: { maxConcurrent?: number },
): Promise<MarketplaceItem[]> {
  const maxConcurrent = options?.maxConcurrent ?? 8;
  const needsEnrich = items.filter((item) => {
    const id = serviceIdOf(item);
    if (id == null) return false;
    return (item.badges ?? []).length === 0;
  });
  if (needsEnrich.length === 0) return items;

  const badgeById = new Map<string, string[]>();
  let index = 0;

  async function worker() {
    while (index < needsEnrich.length) {
      const i = index++;
      const item = needsEnrich[i];
      const id = serviceIdOf(item);
      if (id == null) continue;
      try {
        const badges = await fetchServiceBadges(id);
        if (badges.length > 0) badgeById.set(String(id), badges);
      } catch {
        /* optional endpoint */
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(maxConcurrent, needsEnrich.length) }, () =>
      worker(),
    ),
  );

  return items.map((item) => {
    const id = serviceIdOf(item);
    if (id == null || (item.badges ?? []).length > 0) return item;
    const fetched = badgeById.get(String(id));
    if (!fetched?.length) return item;
    return { ...item, badges: mergeBadgeLists(item.badges, fetched) };
  });
}

/** Public UI: only badges assigned to this service (admin → POST /admin/services/{id}/badges). */
export async function resolveServiceDisplayBadges(
  item: MarketplaceItem,
): Promise<string[]> {
  const serviceId = serviceIdOf(item);
  let serviceBadges = item.badges ?? [];

  if (serviceId != null && serviceBadges.length === 0) {
    try {
      serviceBadges = await fetchServiceBadges(serviceId);
    } catch {
      serviceBadges = [];
    }
  }

  return mergeBadgeLists(serviceBadges);
}
