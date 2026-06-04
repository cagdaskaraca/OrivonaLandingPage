import type { MarketplaceItem } from "@/src/lib/api/types";
import {
  fetchServiceBadges,
  fetchVendorBadges,
} from "@/src/lib/api/premiumSaas";

/** API rozet kodlarını tek listede birleştirir (büyük/küçük harf duyarsız). */
export function mergeBadgeLists(
  ...sources: (string[] | undefined)[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of sources) {
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

/** Hizmet + işletme rozetlerini public API'den çözümler. */
export async function resolveEffectiveServiceBadges(
  item: MarketplaceItem,
): Promise<string[]> {
  const id = serviceIdOf(item);
  const embedded = item.badges ?? [];

  const [fromServiceEndpoint, fromVendor] = await Promise.all([
    id != null ? fetchServiceBadges(id) : Promise.resolve([]),
    item.vendorId != null
      ? fetchVendorBadges(item.vendorId)
      : Promise.resolve([]),
  ]);

  return mergeBadgeLists(embedded, fromServiceEndpoint, fromVendor);
}

export async function enrichMarketplaceItemWithBadges(
  item: MarketplaceItem,
): Promise<MarketplaceItem> {
  const badges = await resolveEffectiveServiceBadges(item);
  return { ...item, badges };
}

export async function enrichMarketplaceItemsWithBadges(
  items: MarketplaceItem[],
): Promise<MarketplaceItem[]> {
  if (items.length === 0) return items;
  return Promise.all(items.map(enrichMarketplaceItemWithBadges));
}
