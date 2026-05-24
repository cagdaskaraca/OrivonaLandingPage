import type { MarketplaceFilters } from "@/src/lib/api/types";

export function buildMarketplaceHref(
  filters: Pick<MarketplaceFilters, "city" | "categoryId" | "keyword" | "district">,
): string {
  const params = new URLSearchParams();
  const city = filters.city?.trim();
  if (city) params.set("city", city);
  const district = filters.district?.trim();
  if (district) params.set("district", district);
  const categoryId = filters.categoryId?.trim();
  if (categoryId) params.set("categoryId", categoryId);
  const keyword = filters.keyword?.trim();
  if (keyword) params.set("keyword", keyword);
  const q = params.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

export function filtersFromSearchParams(
  searchParams: URLSearchParams,
): MarketplaceFilters {
  return {
    city: searchParams.get("city") ?? "",
    district: searchParams.get("district") ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minRating: searchParams.get("minRating") ?? "",
    guestCount: searchParams.get("guestCount") ?? "",
    keyword: searchParams.get("keyword") ?? "",
    page: searchParams.get("page") ?? "",
    pageSize: searchParams.get("pageSize") ?? "",
    sortBy: searchParams.get("sortBy") ?? "",
  };
}
