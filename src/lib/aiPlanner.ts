import type {
  AiBudgetLine,
  AiEventPlanResult,
  AiRecommendationItem,
  MarketplaceItem,
} from "@/src/lib/api/types";

export type AiPlanFormSnapshot = {
  eventType: string;
  city: string;
  district: string;
  guestCount: string;
  budgetMin: string;
  budgetMax: string;
  preferredCategories: string[];
};

export function recommendationServiceId(
  rec: AiRecommendationItem,
): string | number | undefined {
  return rec.serviceId ?? rec.vendorServiceId;
}

export function recommendationToMarketplaceItem(
  rec: AiRecommendationItem,
): MarketplaceItem {
  const id = recommendationServiceId(rec);
  return {
    id,
    vendorServiceId: id,
    serviceTitle: rec.serviceTitle,
    title: rec.serviceTitle,
    vendorName: rec.vendorName,
    basePrice: rec.estimatedPrice,
  };
}

export function normalizeRecommendationReasons(
  reasons?: string[] | string,
): string[] {
  if (!reasons) return [];
  return Array.isArray(reasons) ? reasons : [reasons];
}

export function buildPlanMarketplaceHref(form: AiPlanFormSnapshot): string {
  const params = new URLSearchParams();
  const city = form.city.trim();
  if (city) params.set("city", city);
  const district = form.district.trim();
  if (district) params.set("district", district);
  const guests = form.guestCount.trim();
  if (guests) params.set("guestCount", guests);
  const min = form.budgetMin.trim();
  if (min) params.set("minPrice", min);
  const max = form.budgetMax.trim();
  if (max) params.set("maxPrice", max);
  const q = params.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

export function planHasBudget(plan: AiEventPlanResult | null): boolean {
  return (plan?.budgetBreakdown?.length ?? 0) > 0;
}

export function planHasTimeline(plan: AiEventPlanResult | null): boolean {
  return (plan?.timeline?.length ?? 0) > 0;
}

export function planHasConcepts(plan: AiEventPlanResult | null): boolean {
  return (plan?.conceptIdeas?.length ?? 0) > 0;
}

export function planHasAnyContent(
  plan: AiEventPlanResult | null,
  recommendations: AiRecommendationItem[],
): boolean {
  return (
    Boolean(plan?.summary?.trim()) ||
    planHasBudget(plan) ||
    planHasTimeline(plan) ||
    planHasConcepts(plan) ||
    recommendations.length > 0
  );
}

export function budgetTotal(lines: AiBudgetLine[]): number {
  return lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
}

export function budgetPercent(line: AiBudgetLine, total: number): number {
  if (line.percentage != null) return line.percentage;
  if (!total || line.amount == null) return 0;
  return Math.round((line.amount / total) * 100);
}
