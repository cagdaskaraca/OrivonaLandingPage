import { apiGetRaw, logApiError } from "@/src/lib/api/client";
import {
  getEventPlanBoard as fetchEventPlanBoardCore,
} from "@/src/lib/api/eventPlans";
import { resolveOfferDisplayPrice } from "@/src/lib/offerPricing";
import { recordBool, recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  CustomerAgreement,
  EventPlanBoardData,
  EventPlanBudgetLine,
  EventPlanBudgetSummary,
} from "@/src/lib/api/types";

export type EventPlanAgreementsResult = {
  items: CustomerAgreement[];
  error: string | null;
};

export type EventPlanBudgetSummaryResult = {
  summary: EventPlanBudgetSummary | null;
  error: string | null;
};

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "data",
      "agreements",
      "lines",
      "budgetLines",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

function parseAgreementsList(raw: unknown): CustomerAgreement[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeCustomerAgreement).filter((a) => a.id != null);
  }
  if (raw && typeof raw === "object") {
    const envelope = raw as ApiEnvelope;
    if (envelope.success === false) {
      throw new Error(
        typeof envelope.message === "string"
          ? envelope.message
          : "Anlaşmalar alınamadı.",
      );
    }
    const payload = extractPayload(raw);
    if (Array.isArray(payload)) {
      return payload.map(normalizeCustomerAgreement).filter((a) => a.id != null);
    }
    return toList(payload).map(normalizeCustomerAgreement).filter((a) => a.id != null);
  }
  return [];
}

export function normalizeCustomerAgreement(raw: unknown): CustomerAgreement {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const category =
    recordStr(o, "category", "Category") ??
    recordStr(o, "categoryName", "CategoryName");

  const agreement: CustomerAgreement = {
    id: recordId(o),
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    category,
    categoryName: category,
    serviceType: recordStr(o, "serviceType", "ServiceType"),
    vendorId: recordId(o, "vendorId", "VendorId") ?? null,
    vendorName: recordStr(o, "vendorName", "VendorName"),
    originalPrice: recordNum(o, "originalPrice", "OriginalPrice"),
    finalPrice:
      recordNum(o, "finalPrice", "FinalPrice") ??
      recordNum(o, "discountedPrice", "DiscountedPrice"),
    displayPrice: recordNum(o, "displayPrice", "DisplayPrice"),
    price: recordNum(o, "price", "Price"),
    hasDiscount: recordBool(o, "hasDiscount", "HasDiscount"),
    discountAmount: recordNum(o, "discountAmount", "DiscountAmount"),
    discountPercent: recordNum(o, "discountPercent", "DiscountPercent"),
    couponCode: recordStr(o, "couponCode", "CouponCode"),
    agreementDate:
      recordStr(o, "agreementDate", "AgreementDate") ??
      recordStr(o, "agreedAt", "AgreedAt"),
    note: recordStr(o, "note", "Note"),
    status: recordStr(o, "status", "Status"),
  };
  const resolved = resolveOfferDisplayPrice(agreement);
  agreement.agreedPrice = resolved > 0 ? resolved : undefined;
  return agreement;
}

function normalizeBudgetLine(raw: unknown): EventPlanBudgetLine {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const category =
    recordStr(o, "category", "Category") ??
    recordStr(o, "categoryName", "CategoryName");

  const line: EventPlanBudgetLine = {
    id: recordId(o),
    category,
    categoryName: category,
    serviceType: recordStr(o, "serviceType", "ServiceType"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    originalPrice: recordNum(o, "originalPrice", "OriginalPrice"),
    finalPrice:
      recordNum(o, "finalPrice", "FinalPrice") ??
      recordNum(o, "discountedPrice", "DiscountedPrice"),
    displayPrice: recordNum(o, "displayPrice", "DisplayPrice"),
    price: recordNum(o, "price", "Price"),
    agreedPrice: recordNum(o, "agreedPrice", "AgreedPrice"),
    hasDiscount: recordBool(o, "hasDiscount", "HasDiscount"),
    discountAmount: recordNum(o, "discountAmount", "DiscountAmount"),
    discountPercent: recordNum(o, "discountPercent", "DiscountPercent"),
    couponCode: recordStr(o, "couponCode", "CouponCode"),
    agreementDate: recordStr(o, "agreementDate", "AgreementDate"),
    note: recordStr(o, "note", "Note"),
    amount: recordNum(o, "amount", "Amount"),
  };
  const resolved = resolveOfferDisplayPrice(line);
  if (resolved > 0) {
    line.agreedPrice = resolved;
    line.amount = resolved;
  }
  return line;
}

export function normalizeEventPlanBudgetSummary(
  raw: unknown,
): EventPlanBudgetSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const itemsRaw = o.items ?? o.Items ?? o.lines ?? o.Lines;
  const spent =
    recordNum(o, "spentBudget", "SpentBudget") ??
    recordNum(o, "totalSpent", "TotalSpent");

  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(normalizeBudgetLine)
    : toList(itemsRaw).map(normalizeBudgetLine);

  return {
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    totalBudget: recordNum(o, "totalBudget", "TotalBudget"),
    spentBudget: spent,
    totalSpent: spent,
    remainingBudget:
      recordNum(o, "remainingBudget", "RemainingBudget") ??
      recordNum(o, "remaining", "Remaining"),
    items,
    lines: items,
  };
}

function parseBudgetPayload(raw: unknown): EventPlanBudgetSummary {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const envelope = raw as ApiEnvelope;
    if ("success" in envelope && envelope.success === false) {
      throw new Error(
        typeof envelope.message === "string"
          ? envelope.message
          : "Bütçe özeti alınamadı.",
      );
    }
  }
  return normalizeEventPlanBudgetSummary(extractPayload(raw) ?? raw);
}

/** GET /event-plans/{eventPlanId}/board — hata olursa null (prefetch / opsiyonel). */
export async function getEventPlanBoard(
  eventPlanId: string | number,
): Promise<EventPlanBoardData | null> {
  try {
    return await fetchEventPlanBoardCore(eventPlanId);
  } catch (err) {
    logApiError("Event plan board", err);
    return null;
  }
}

/** GET /event-plans/{eventPlanId}/agreements — hata olursa boş liste + mesaj. */
export async function getEventPlanAgreements(
  eventPlanId: string | number,
): Promise<EventPlanAgreementsResult> {
  try {
    const raw = await apiGetRaw<unknown>(
      `/event-plans/${eventPlanId}/agreements`,
    );
    return { items: parseAgreementsList(raw), error: null };
  } catch (err) {
    logApiError("Event plan agreements", err);
    return {
      items: [],
      error: "Kabul edilmiş teklifler şu an yüklenemedi.",
    };
  }
}

/** GET /event-plans/{eventPlanId}/budget-summary */
export async function getEventPlanBudgetSummary(
  eventPlanId: string | number,
): Promise<EventPlanBudgetSummaryResult> {
  try {
    const raw = await apiGetRaw<unknown>(
      `/event-plans/${eventPlanId}/budget-summary`,
    );
    return { summary: parseBudgetPayload(raw), error: null };
  } catch (err) {
    logApiError("Event plan budget summary", err);
    return { summary: null, error: "Bütçe bilgisi yüklenemedi" };
  }
}

/** @deprecated use getEventPlanAgreements */
export const getAgreements = async (planId: string | number) =>
  (await getEventPlanAgreements(planId)).items;

/** @deprecated use getEventPlanBudgetSummary */
export const getBudgetSummary = async (planId: string | number) => {
  const result = await getEventPlanBudgetSummary(planId);
  if (result.error || !result.summary) {
    throw new Error(result.error ?? "Bütçe bilgisi yüklenemedi");
  }
  return result.summary;
};
