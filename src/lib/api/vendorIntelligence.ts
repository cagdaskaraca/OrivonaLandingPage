import {
  apiGetPublicRaw,
  apiGetRaw,
  apiPostPublicRaw,
  apiPostRaw,
  isApiNotFound,
  withOptionalNotFound,
} from "@/src/lib/api/client";
import { recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  ReviewIntelligenceSummary,
  VendorAnalyticsSummary,
  VendorLead,
  VendorLeadFunnelStage,
  VendorMonthlyAnalytics,
  VendorServicePerformance,
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

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "data",
      "leads",
      "services",
      "stages",
      "months",
      "rows",
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

export function normalizeVendorLead(raw: unknown): VendorLead {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const serviceId =
    recordId(o, "serviceId", "ServiceId") ??
    recordId(o, "vendorServiceId", "VendorServiceId");
  return {
    id: recordId(o),
    customerName:
      recordStr(o, "customerName", "CustomerName") ??
      recordStr(o, "fullName", "FullName"),
    customerEmail: recordStr(o, "customerEmail", "CustomerEmail"),
    serviceTitle:
      recordStr(o, "serviceTitle", "ServiceTitle") ??
      recordStr(o, "title", "Title"),
    serviceId,
    vendorServiceId: serviceId,
    status: recordStr(o, "status", "Status") ?? "New",
    score: recordNum(o, "score", "Score") ?? recordNum(o, "leadScore", "LeadScore"),
    lastActivityAt:
      recordStr(o, "lastActivityAt", "LastActivityAt") ??
      recordStr(o, "lastActivity", "LastActivity"),
    lastActivity: recordStr(o, "lastActivity", "LastActivity"),
    notes: recordStr(o, "notes", "Notes") ?? recordStr(o, "note", "Note"),
    note: recordStr(o, "note", "Note"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

export function normalizeAnalyticsSummary(raw: unknown): VendorAnalyticsSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const responseTime =
    recordStr(o, "averageResponseTime", "AverageResponseTime") ??
    recordStr(o, "avgResponseTime", "AvgResponseTime");
  return {
    totalViews:
      recordNum(o, "totalViews", "TotalViews") ??
      recordNum(o, "views", "Views"),
    totalMessages:
      recordNum(o, "totalMessages", "TotalMessages") ??
      recordNum(o, "messages", "Messages"),
    totalOffers:
      recordNum(o, "totalOffers", "TotalOffers") ??
      recordNum(o, "offers", "Offers"),
    reservations:
      recordNum(o, "reservations", "Reservations") ??
      recordNum(o, "totalReservations", "TotalReservations"),
    totalReservations: recordNum(o, "totalReservations", "TotalReservations"),
    conversionRate:
      recordNum(o, "conversionRate", "ConversionRate") ??
      recordNum(o, "conversion", "Conversion"),
    estimatedRevenue:
      recordNum(o, "estimatedRevenue", "EstimatedRevenue") ??
      recordNum(o, "revenue", "Revenue"),
    averageResponseTime: responseTime,
    averageResponseTimeMinutes:
      recordNum(o, "averageResponseTimeMinutes", "AverageResponseTimeMinutes") ??
      recordNum(o, "avgResponseMinutes", "AvgResponseMinutes"),
  };
}

export function normalizeServicePerformance(raw: unknown): VendorServicePerformance {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const serviceId =
    recordId(o, "serviceId", "ServiceId") ??
    recordId(o, "vendorServiceId", "VendorServiceId");
  return {
    serviceId,
    vendorServiceId: serviceId,
    serviceTitle:
      recordStr(o, "serviceTitle", "ServiceTitle") ??
      recordStr(o, "title", "Title"),
    title: recordStr(o, "title", "Title"),
    views: recordNum(o, "views", "Views"),
    messages: recordNum(o, "messages", "Messages"),
    offers: recordNum(o, "offers", "Offers"),
    conversionRate:
      recordNum(o, "conversionRate", "ConversionRate") ??
      recordNum(o, "conversion", "Conversion"),
  };
}

export function normalizeFunnelStage(raw: unknown): VendorLeadFunnelStage {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    status: recordStr(o, "status", "Status"),
    count: recordNum(o, "count", "Count"),
    label: recordStr(o, "label", "Label"),
  };
}

export function normalizeMonthlyAnalytics(raw: unknown): VendorMonthlyAnalytics {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    month: recordStr(o, "month", "Month"),
    year: recordNum(o, "year", "Year"),
    views: recordNum(o, "views", "Views"),
    messages: recordNum(o, "messages", "Messages"),
    offers: recordNum(o, "offers", "Offers"),
    reservations: recordNum(o, "reservations", "Reservations"),
    revenue: recordNum(o, "revenue", "Revenue"),
  };
}

export function normalizeReviewSummary(raw: unknown): ReviewIntelligenceSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const positivesRaw = o.positives ?? o.Positives ?? o.strengths ?? o.Strengths;
  const improveRaw =
    o.improvements ?? o.Improvements ?? o.areasToImprove ?? o.AreasToImprove;
  return {
    aiSummary:
      recordStr(o, "aiSummary", "AiSummary") ??
      recordStr(o, "summary", "Summary"),
    summary: recordStr(o, "summary", "Summary"),
    positives: Array.isArray(positivesRaw)
      ? positivesRaw.map(String)
      : undefined,
    strengths: Array.isArray(o.strengths)
      ? (o.strengths as unknown[]).map(String)
      : undefined,
    improvements: Array.isArray(improveRaw)
      ? improveRaw.map(String)
      : undefined,
    areasToImprove: Array.isArray(o.areasToImprove)
      ? (o.areasToImprove as unknown[]).map(String)
      : undefined,
  };
}

// ——— Leads ———

export async function fetchVendorLeads(): Promise<VendorLead[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/vendor/leads");
      assertSuccess(body);
      const data = toList(extractPayload(body.data)).map(normalizeVendorLead);
      console.log("Vendor CRM response", data);
      return data;
    },
    [],
  );
}

export async function fetchVendorLeadById(
  id: string | number,
): Promise<VendorLead> {
  const body = await apiGetRaw<ApiEnvelope>(`/vendor/leads/${id}`);
  assertSuccess(body);
  const payload = extractPayload(body.data);
  return normalizeVendorLead(payload ?? body.data);
}

export async function updateVendorLeadStatus(
  id: string | number,
  status: string,
): Promise<VendorLead> {
  const body = await apiPostRaw<ApiEnvelope>(`/vendor/leads/${id}/status`, {
    status,
  });
  assertSuccess(body);
  const payload = extractPayload(body.data);
  return normalizeVendorLead(payload ?? body.data);
}

export async function addVendorLeadNote(
  id: string | number,
  note: string,
): Promise<VendorLead> {
  const body = await apiPostRaw<ApiEnvelope>(`/vendor/leads/${id}/note`, {
    note,
    notes: note,
  });
  assertSuccess(body);
  const payload = extractPayload(body.data);
  return normalizeVendorLead(payload ?? body.data);
}

// ——— Analytics ———

export async function fetchVendorAnalyticsSummary(): Promise<VendorAnalyticsSummary> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/vendor/analytics/summary");
      assertSuccess(body);
      const data = normalizeAnalyticsSummary(
        extractPayload(body.data) ?? body.data,
      );
      console.log("Vendor analytics response", data);
      return data;
    },
    {},
  );
}

export async function fetchVendorAnalyticsServices(): Promise<
  VendorServicePerformance[]
> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/vendor/analytics/services");
      assertSuccess(body);
      const data = toList(extractPayload(body.data)).map(
        normalizeServicePerformance,
      );
      console.log("Vendor analytics response", data);
      return data;
    },
    [],
  );
}

export async function fetchVendorAnalyticsLeads(): Promise<VendorLeadFunnelStage[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/vendor/analytics/leads");
      assertSuccess(body);
      const payload = extractPayload(body.data);
      let data: VendorLeadFunnelStage[];
      if (Array.isArray(payload)) {
        data = payload.map(normalizeFunnelStage);
      } else if (payload && typeof payload === "object") {
        const o = payload as Record<string, unknown>;
        const stages = o.stages ?? o.Stages ?? o.funnel;
        data = Array.isArray(stages)
          ? stages.map(normalizeFunnelStage)
          : toList(body.data).map(normalizeFunnelStage);
      } else {
        data = toList(body.data).map(normalizeFunnelStage);
      }
      console.log("Vendor analytics response", data);
      return data;
    },
    [],
  );
}

export async function fetchVendorAnalyticsMonthly(): Promise<
  VendorMonthlyAnalytics[]
> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/vendor/analytics/monthly");
      assertSuccess(body);
      const data = toList(extractPayload(body.data)).map(
        normalizeMonthlyAnalytics,
      );
      console.log("Vendor analytics response", data);
      return data;
    },
    [],
  );
}

// ——— Track view ———

export async function trackServiceView(serviceId: string | number): Promise<void> {
  const body = await apiPostPublicRaw<ApiEnvelope>(
    `/services/${serviceId}/track-view`,
    {},
  );
  assertSuccess(body);
}

// ——— Review intelligence ———

export async function fetchServiceReviewSummary(
  serviceId: string | number,
): Promise<ReviewIntelligenceSummary> {
  const body = await apiGetPublicRaw<ApiEnvelope>(
    `/services/${serviceId}/review-summary`,
  );
  assertSuccess(body);
  return normalizeReviewSummary(extractPayload(body.data) ?? body.data);
}

export async function fetchVendorReviewSummary(): Promise<ReviewIntelligenceSummary> {
  const body = await apiGetRaw<ApiEnvelope>("/vendor/review-summary");
  assertSuccess(body);
  return normalizeReviewSummary(extractPayload(body.data) ?? body.data);
}
