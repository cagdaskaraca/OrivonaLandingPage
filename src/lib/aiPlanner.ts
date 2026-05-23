import type {
  AiBudgetLine,
  AiEventPlanResult,
  AiRecommendationItem,
  MarketplaceItem,
} from "@/src/lib/api/types";

export function recommendationServiceId(
  rec: AiRecommendationItem,
): string | number | undefined {
  return rec.serviceId ?? rec.vendorServiceId;
}

export function recommendationToMarketplaceItem(
  rec: AiRecommendationItem,
): MarketplaceItem {
  const id = recommendationServiceId(rec);
  const title = rec.serviceTitle ?? rec.title;
  const price = rec.price ?? rec.estimatedPrice ?? rec.basePrice;
  return {
    id,
    vendorServiceId: id,
    vendorId: rec.vendorId,
    serviceTitle: title,
    title,
    vendorName: rec.vendorName,
    categoryName: rec.categoryName ?? rec.category,
    category: rec.categoryName ?? rec.category,
    city: rec.city,
    district: rec.district,
    price,
    basePrice: price,
    minPrice: price,
    rating: rec.rating ?? rec.averageRating,
    averageRating: rec.rating ?? rec.averageRating,
    reviewCount: rec.reviewCount,
    coverImageUrl: rec.coverImageUrl,
    imageUrl: rec.imageUrl,
  };
}

export function normalizeRecommendationReasons(
  reasons?: string[] | string,
): string[] {
  if (!reasons) return [];
  return Array.isArray(reasons) ? reasons : [reasons];
}

export function buildPlanMarketplaceHref(
  plan: AiEventPlanResult | null,
): string {
  const params = new URLSearchParams();
  const city = plan?.city?.trim();
  if (city) params.set("city", city);
  const district = plan?.district?.trim();
  if (district) params.set("district", district);
  if (plan?.guestCount != null) params.set("guestCount", String(plan.guestCount));
  if (plan?.budgetMin != null) params.set("minPrice", String(plan.budgetMin));
  if (plan?.budgetMax != null) params.set("maxPrice", String(plan.budgetMax));
  const q = params.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

export function planHasBudget(plan: AiEventPlanResult | null): boolean {
  return (plan?.budgetBreakdown?.length ?? 0) > 0;
}

export function planHasTimeline(plan: AiEventPlanResult | null): boolean {
  return (plan?.timeline?.length ?? 0) > 0;
}

export function planHasChecklist(plan: AiEventPlanResult | null): boolean {
  return (plan?.checklist?.length ?? 0) > 0;
}

export function planHasTips(plan: AiEventPlanResult | null): boolean {
  return (plan?.aiTips?.length ?? 0) > 0;
}

export function planHasConcepts(plan: AiEventPlanResult | null): boolean {
  return (plan?.conceptIdeas?.length ?? 0) > 0;
}

export function planHasDetected(plan: AiEventPlanResult | null): boolean {
  if (!plan) return false;
  return Boolean(
    plan.eventType?.trim() ||
      plan.city?.trim() ||
      plan.district?.trim() ||
      plan.guestCount != null ||
      plan.budgetMin != null ||
      plan.budgetMax != null ||
      plan.style?.trim() ||
      plan.theme?.trim(),
  );
}

export function planHasAnyContent(
  plan: AiEventPlanResult | null,
  recommendations: AiRecommendationItem[],
): boolean {
  return (
    Boolean(plan?.summary?.trim()) ||
    planHasDetected(plan) ||
    planHasBudget(plan) ||
    plan?.totalEstimatedMin != null ||
    plan?.totalEstimatedMax != null ||
    Boolean(plan?.budgetStatus?.trim()) ||
    Boolean(plan?.budgetWarning?.trim()) ||
    planHasTimeline(plan) ||
    planHasChecklist(plan) ||
    planHasTips(plan) ||
    planHasConcepts(plan) ||
    recommendations.length > 0
  );
}

export function formatTry(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} ₺`;
}

export function budgetLineAmountTotal(lines: AiBudgetLine[]): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      (line.suggestedBudget ??
        line.amount ??
        line.estimatedMax ??
        line.estimatedMin ??
        0),
    0,
  );
}

export function budgetPercent(line: AiBudgetLine, total: number): number {
  if (line.percentage != null) return Math.round(line.percentage);
  const value =
    line.suggestedBudget ?? line.amount ?? line.estimatedMax ?? line.estimatedMin;
  if (!total || value == null) return 0;
  return Math.round((value / total) * 100);
}

const GENERIC_BUDGET_LABELS = new Set([
  "",
  "kategori",
  "category",
  "categories",
  "genel",
  "other",
  "diğer",
  "diger",
]);

function isGenericBudgetLabel(value?: string | null): boolean {
  if (!value?.trim()) return true;
  return GENERIC_BUDGET_LABELS.has(value.trim().toLowerCase());
}

/** Display label for budget row — never returns generic "Kategori". */
export function resolveBudgetLineLabel(line: AiBudgetLine): string {
  const categoryName = line.categoryName?.trim();
  if (categoryName && !isGenericBudgetLabel(categoryName)) {
    return categoryName;
  }
  const category = line.category?.trim();
  if (category && !isGenericBudgetLabel(category)) {
    return category;
  }
  return "Diğer";
}

export function formatMonthOffset(offset?: number): string {
  if (offset == null || Number.isNaN(offset)) return "";
  if (offset === 0) return "Etkinlik ayı";
  if (offset === 1) return "1 ay önce";
  return `${offset} ay önce`;
}
