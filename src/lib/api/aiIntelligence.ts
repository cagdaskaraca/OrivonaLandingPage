import { apiPostPublicRaw } from "@/src/lib/api/client";
import { recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  AiBudgetOptimizerResult,
  AiMissingServicesResult,
  AiMoodboardResult,
  AiPromptRequest,
  AiRecommendationItem,
  AiSimilarEventsResult,
  AiStyleMatchResult,
  ApiEnvelope,
} from "@/src/lib/api/types";

function assertSuccess(envelope: ApiEnvelope): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

function toStringList(raw: unknown): string[] | undefined {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) return [raw];
  return undefined;
}

function normalizeRecommendation(raw: unknown): AiRecommendationItem {
  if (!raw || typeof raw !== "object") return {};
  const item = raw as Record<string, unknown>;
  const serviceId =
    recordId(item, "serviceId", "ServiceId") ??
    recordId(item, "vendorServiceId", "VendorServiceId");
  const title =
    recordStr(item, "serviceTitle", "ServiceTitle") ??
    recordStr(item, "title", "Title");
  const price =
    recordNum(item, "price", "Price") ??
    recordNum(item, "basePrice", "BasePrice") ??
    recordNum(item, "estimatedPrice", "EstimatedPrice");
  return {
    vendorName: recordStr(item, "vendorName", "VendorName"),
    serviceTitle: title,
    title,
    categoryName:
      recordStr(item, "categoryName", "CategoryName") ??
      recordStr(item, "category", "Category"),
    city: recordStr(item, "city", "City"),
    district: recordStr(item, "district", "District"),
    price,
    basePrice: price,
    rating:
      recordNum(item, "rating", "Rating") ??
      recordNum(item, "averageRating", "AverageRating"),
    score:
      recordNum(item, "score", "Score") ??
      recordNum(item, "styleScore", "StyleScore"),
    serviceId,
    vendorServiceId: serviceId,
    vendorId: recordId(item, "vendorId", "VendorId"),
  };
}

export function normalizeMoodboard(raw: unknown): AiMoodboardResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const palette = o.colorPalette ?? o.ColorPalette ?? o.colors ?? o.Colors;
  return {
    themeTitle:
      recordStr(o, "themeTitle", "ThemeTitle") ??
      recordStr(o, "theme", "Theme"),
    colorPalette: Array.isArray(palette)
      ? palette.map(String)
      : toStringList(palette),
    decorationIdeas: toStringList(
      o.decorationIdeas ?? o.DecorationIdeas ?? o.decorations,
    ),
    musicIdeas: toStringList(o.musicIdeas ?? o.MusicIdeas ?? o.music),
    dressCodeIdeas: toStringList(
      o.dressCodeIdeas ?? o.DressCodeIdeas ?? o.dressCode,
    ),
    foodIdeas: toStringList(o.foodIdeas ?? o.FoodIdeas ?? o.food),
    photoStyleIdeas: toStringList(
      o.photoStyleIdeas ?? o.PhotoStyleIdeas ?? o.photoStyle,
    ),
  };
}

export function normalizeBudgetOptimizer(raw: unknown): AiBudgetOptimizerResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const over =
    o.overBudget ?? o.OverBudget ?? o.isOverBudget ?? o.IsOverBudget;
  return {
    currentTotal:
      recordNum(o, "currentTotal", "CurrentTotal") ??
      recordNum(o, "total", "Total"),
    budget:
      recordNum(o, "budget", "Budget") ??
      recordNum(o, "targetBudget", "TargetBudget"),
    overBudget: typeof over === "boolean" ? over : undefined,
    budgetWarning:
      recordStr(o, "budgetWarning", "BudgetWarning") ??
      recordStr(o, "warning", "Warning"),
    savingSuggestions: toStringList(
      o.savingSuggestions ??
        o.SavingSuggestions ??
        o.suggestions ??
        o.Suggestions,
    ),
    estimatedSavings:
      recordNum(o, "estimatedSavings", "EstimatedSavings") ??
      recordNum(o, "savings", "Savings"),
  };
}

export function normalizeMissingServices(raw: unknown): AiMissingServicesResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    selectedCategories: toStringList(
      o.selectedCategories ?? o.SelectedCategories ?? o.selected,
    ),
    missingCategories: toStringList(
      o.missingCategories ?? o.MissingCategories ?? o.missing,
    ),
    recommendedNextSteps: toStringList(
      o.recommendedNextSteps ??
        o.RecommendedNextSteps ??
        o.nextSteps ??
        o.steps,
    ),
  };
}

export function normalizeStyleMatch(raw: unknown): AiStyleMatchResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const servicesRaw =
    o.matchedServices ??
    o.MatchedServices ??
    o.services ??
    o.Services ??
    o.recommendations;
  return {
    styleScore:
      recordNum(o, "styleScore", "StyleScore") ??
      recordNum(o, "score", "Score"),
    explanation:
      recordStr(o, "explanation", "Explanation") ??
      recordStr(o, "summary", "Summary"),
    matchedServices: Array.isArray(servicesRaw)
      ? servicesRaw.map(normalizeRecommendation)
      : undefined,
  };
}

export function normalizeSimilarEvents(raw: unknown): AiSimilarEventsResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const checklist =
    o.commonChecklist ?? o.CommonChecklist ?? o.checklist ?? o.Checklist;
  return {
    averageBudget:
      recordNum(o, "averageBudget", "AverageBudget") ??
      recordNum(o, "avgBudget", "AvgBudget"),
    popularCategories: toStringList(
      o.popularCategories ?? o.PopularCategories ?? o.categories,
    ),
    commonChecklist: Array.isArray(checklist)
      ? checklist.map((c) => {
          if (typeof c === "string") return c;
          if (c && typeof c === "object") {
            const row = c as Record<string, unknown>;
            const title = recordStr(row, "title", "Title");
            const desc = recordStr(row, "description", "Description");
            return [title, desc].filter(Boolean).join(" — ");
          }
          return String(c);
        })
      : toStringList(checklist),
    insights: toStringList(o.insights ?? o.Insights),
  };
}

async function postAi<T>(
  path: string,
  payload: AiPromptRequest,
  normalize: (raw: unknown) => T,
): Promise<T> {
  const body = await apiPostPublicRaw<ApiEnvelope>(path, payload);
  assertSuccess(body);
  return normalize(extractPayload(body.data) ?? body.data);
}

export function fetchAiMoodboard(payload: AiPromptRequest): Promise<AiMoodboardResult> {
  return postAi("/ai/moodboard", payload, normalizeMoodboard);
}

export function fetchAiBudgetOptimizer(
  payload: AiPromptRequest,
): Promise<AiBudgetOptimizerResult> {
  return postAi("/ai/budget-optimizer", payload, normalizeBudgetOptimizer);
}

export function fetchAiMissingServices(
  payload: AiPromptRequest,
): Promise<AiMissingServicesResult> {
  return postAi("/ai/missing-services", payload, normalizeMissingServices);
}

export function fetchAiStyleMatch(
  payload: AiPromptRequest,
): Promise<AiStyleMatchResult> {
  return postAi("/ai/style-match", payload, normalizeStyleMatch);
}

export function fetchAiSimilarEvents(
  payload: AiPromptRequest,
): Promise<AiSimilarEventsResult> {
  return postAi("/ai/similar-events", payload, normalizeSimilarEvents);
}
