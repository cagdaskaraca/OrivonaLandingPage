import type { MarketplaceItem } from "@/src/lib/api/types";

export const DEFAULT_CATEGORY_IMAGE = "/marketplace/categories/default.jpg";

/** Local fallback paths under public/marketplace/categories/ */
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  mekan: "/marketplace/categories/mekan.jpg",
  fotografci: "/marketplace/categories/fotografci.jpg",
  catering: "/marketplace/categories/catering.jpg",
  muzik: "/marketplace/categories/muzik.jpg",
  dekorasyon: "/marketplace/categories/dekorasyon.jpg",
  "organizasyon-planlayici": "/marketplace/categories/organizasyon-planlayici.jpg",
  gelinlik: "/marketplace/categories/gelinlik.jpg",
  "sac-makyaj": "/marketplace/categories/sac-makyaj.jpg",
  ulasim: "/marketplace/categories/ulasim.jpg",
  davetiye: "/marketplace/categories/davetiye.jpg",
  pasta: "/marketplace/categories/pasta.jpg",
  "nikah-sekeri": "/marketplace/categories/nikah-sekeri.jpg",
};

/** Turkish-safe slug for category file lookup. */
export function normalizeCategorySlug(categoryName: string): string {
  return categoryName
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCategoryFallbackImage(
  categoryName?: string | null,
): string {
  if (!categoryName?.trim()) return DEFAULT_CATEGORY_IMAGE;
  const slug = normalizeCategorySlug(categoryName);
  return CATEGORY_IMAGE_BY_SLUG[slug] ?? DEFAULT_CATEGORY_IMAGE;
}

type ServiceImageSource = Pick<
  MarketplaceItem,
  "coverImageUrl" | "imageUrl" | "categoryName" | "category"
>;

/** Cover from API, else local category fallback (then default.jpg on load error). */
export function getServiceImageUrl(service: ServiceImageSource): string {
  const cover =
    (typeof service.coverImageUrl === "string" && service.coverImageUrl.trim()) ||
    (typeof service.imageUrl === "string" && service.imageUrl.trim());
  if (cover) return cover;
  return getCategoryFallbackImage(service.categoryName ?? service.category);
}

export function isLocalMarketplaceImage(src: string): boolean {
  return src.startsWith("/marketplace/categories/");
}

/** Gallery URLs for detail page (cover + API images, deduped). */
export function getServiceGalleryUrls(
  service: ServiceImageSource & {
    images?: { url?: string; imageUrl?: string }[];
  },
): string[] {
  const seen = new Set<string>();
  const list: string[] = [];

  const add = (url?: string) => {
    const u = url?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    list.push(u);
  };

  add(getServiceImageUrl(service));
  for (const img of service.images ?? []) {
    add(img.url ?? img.imageUrl);
  }

  return list.length > 0 ? list : [getCategoryFallbackImage(service.categoryName ?? service.category)];
}
