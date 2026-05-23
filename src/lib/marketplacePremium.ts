import type { MarketplaceItem } from "@/src/lib/api/types";

/** Premium sort options for marketplace UI (sent as API `sortBy`). */
export const MARKETPLACE_SORT_OPTIONS = [
  { value: "", label: "Varsayılan" },
  { value: "aiScore", label: "AI skoru" },
  { value: "popular", label: "Popüler" },
  { value: "rating", label: "En yüksek puan" },
  { value: "priceAsc", label: "En düşük fiyat" },
  { value: "priceDesc", label: "En yüksek fiyat" },
  { value: "newest", label: "En yeni" },
] as const;

export function isPremiumVendor(item: MarketplaceItem): boolean {
  if (item.isVendorPremium) return true;
  return (item.badges ?? []).some((b) =>
    b.toLowerCase().includes("premium"),
  );
}

export function featuredCardClasses(isFeatured: boolean): string {
  if (!isFeatured) return "";
  return [
    "ring-1 ring-amber-300/35",
    "border-amber-200/20",
    "shadow-[0_0_36px_-6px_rgba(251,191,36,0.45),0_0_56px_-12px_rgba(139,92,246,0.4),0_12px_48px_-18px_rgba(24,12,48,0.75)]",
    "hover:shadow-[0_0_44px_-4px_rgba(251,191,36,0.55),0_0_64px_-8px_rgba(167,139,250,0.5),0_18px_48px_-16px_rgba(109,40,217,0.4)]",
    "hover:border-amber-300/30",
  ].join(" ");
}

export const featuredBadgeClass =
  "inline-flex rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-violet-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.35)]";

export const premiumBadgeClass =
  "inline-flex shrink-0 rounded-full border border-amber-200/40 bg-gradient-to-r from-amber-400/20 to-amber-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-50 shadow-[0_0_12px_rgba(245,158,11,0.25)]";

function ratingOf(item: MarketplaceItem): number {
  return item.rating ?? item.averageRating ?? 0;
}

function dateMs(item: MarketplaceItem): number {
  if (!item.createdAt) return 0;
  const t = new Date(item.createdAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function idNum(item: MarketplaceItem): number {
  const id = item.vendorServiceId ?? item.id;
  if (typeof id === "number") return id;
  if (typeof id === "string") {
    const n = Number(id);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function priceOf(item: MarketplaceItem): number {
  return (
    item.price ?? item.basePrice ?? item.minPrice ?? item.maxPrice ?? 0
  );
}

function aiScoreOf(item: MarketplaceItem): number {
  const raw = (item as MarketplaceItem & { aiScore?: number }).aiScore;
  return typeof raw === "number" ? raw : 0;
}

/** Client-side sort fallback when API returns unsorted data. */
export function sortMarketplaceItems(
  items: MarketplaceItem[],
  sortBy: string,
): MarketplaceItem[] {
  const list = [...items];
  switch (sortBy) {
    case "aiScore":
      return list.sort(
        (a, b) =>
          aiScoreOf(b) - aiScoreOf(a) ||
          ratingOf(b) - ratingOf(a) ||
          (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0),
      );
    case "popular":
      return list.sort(
        (a, b) =>
          (b.reviewCount ?? 0) - (a.reviewCount ?? 0) ||
          ratingOf(b) - ratingOf(a) ||
          (isPremiumVendor(b) ? 1 : 0) - (isPremiumVendor(a) ? 1 : 0),
      );
    case "newest":
      return list.sort(
        (a, b) => dateMs(b) - dateMs(a) || idNum(b) - idNum(a),
      );
    case "rating":
    case "rating_desc":
      return list.sort((a, b) => ratingOf(b) - ratingOf(a));
    case "priceAsc":
      return list.sort((a, b) => priceOf(a) - priceOf(b));
    case "priceDesc":
      return list.sort((a, b) => priceOf(b) - priceOf(a));
    case "featured":
      return list.sort(
        (a, b) =>
          (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) ||
          ratingOf(b) - ratingOf(a),
      );
    default:
      return list;
  }
}
