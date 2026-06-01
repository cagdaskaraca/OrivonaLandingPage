import { apiGetRaw } from "@/src/lib/api/client";
import { recordBool, recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  CustomerAgreement,
  EventPlanBudgetLine,
  EventPlanBudgetSummary,
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
      "agreements",
      "lines",
      "budgetLines",
      "acceptedOffers",
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

export function normalizeCustomerAgreement(raw: unknown): CustomerAgreement {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const nestedOffer =
    o.offer && typeof o.offer === "object"
      ? (o.offer as Record<string, unknown>)
      : null;

  const companyName =
    recordStr(o, "companyName", "CompanyName") ??
    recordStr(o, "vendorName", "VendorName") ??
    recordStr(o, "businessName", "BusinessName") ??
    (nestedOffer
      ? recordStr(nestedOffer, "vendorName", "VendorName")
      : undefined);

  const agreedPrice =
    recordNum(o, "agreedPrice", "AgreedPrice") ??
    recordNum(o, "vendorOfferPrice", "VendorOfferPrice") ??
    recordNum(o, "offeredPrice", "OfferedPrice") ??
    recordNum(o, "price", "Price") ??
    recordNum(o, "amount", "Amount") ??
    (nestedOffer
      ? recordNum(nestedOffer, "price", "Price") ??
        recordNum(nestedOffer, "vendorOfferPrice", "VendorOfferPrice")
      : undefined);

  const description =
    recordStr(o, "description", "Description") ??
    recordStr(o, "vendorOfferDescription", "VendorOfferDescription") ??
    recordStr(o, "serviceDescription", "ServiceDescription") ??
    recordStr(o, "responseDescription", "ResponseDescription") ??
    (nestedOffer
      ? recordStr(nestedOffer, "description", "Description")
      : undefined);

  return {
    id:
      recordId(o) ??
      recordId(o, "offerId", "OfferId") ??
      recordId(o, "offerRequestId", "OfferRequestId"),
    offerId: recordId(o, "offerId", "OfferId"),
    offerRequestId:
      recordId(o, "offerRequestId", "OfferRequestId") ?? recordId(o),
    eventPlanId:
      recordId(o, "eventPlanId", "EventPlanId") ??
      recordId(o, "planId", "PlanId"),
    taskId: recordId(o, "taskId", "TaskId"),
    companyName,
    vendorName:
      recordStr(o, "vendorName", "VendorName") ??
      (nestedOffer
        ? recordStr(nestedOffer, "vendorName", "VendorName")
        : undefined),
    businessName: recordStr(o, "businessName", "BusinessName"),
    serviceTitle:
      recordStr(o, "serviceTitle", "ServiceTitle") ??
      recordStr(o, "serviceName", "ServiceName"),
    categoryName:
      recordStr(o, "categoryName", "CategoryName") ??
      recordStr(o, "serviceCategoryName", "ServiceCategoryName"),
    serviceType:
      recordStr(o, "serviceType", "ServiceType") ??
      recordStr(o, "category", "Category"),
    serviceCategoryName: recordStr(
      o,
      "serviceCategoryName",
      "ServiceCategoryName",
    ),
    categoryId: recordId(o, "categoryId", "CategoryId"),
    agreedPrice,
    agreementDate:
      recordStr(o, "agreementDate", "AgreementDate") ??
      recordStr(o, "agreedAt", "AgreedAt") ??
      recordStr(o, "acceptedAt", "AcceptedAt") ??
      recordStr(o, "eventDate", "EventDate"),
    description,
    vendorOfferDescription: recordStr(
      o,
      "vendorOfferDescription",
      "VendorOfferDescription",
    ),
    note: recordStr(o, "note", "Note") ?? recordStr(o, "notes", "Notes"),
    status:
      recordStr(o, "status", "Status") ??
      recordStr(o, "offerStatus", "OfferStatus"),
    statusLabel: recordStr(o, "statusLabel", "StatusLabel"),
    isActive:
      recordBool(o, "isActive", "IsActive") ??
      (recordStr(o, "status", "Status")?.toLowerCase() === "inactive"
        ? false
        : undefined),
  };
}

function normalizeBudgetLine(raw: unknown): EventPlanBudgetLine {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    agreementId:
      recordId(o) ?? recordId(o, "offerId", "OfferId"),
    taskId: recordId(o, "taskId", "TaskId"),
    label:
      recordStr(o, "label", "Label") ??
      recordStr(o, "companyName", "CompanyName") ??
      recordStr(o, "vendorName", "VendorName") ??
      recordStr(o, "categoryName", "CategoryName"),
    companyName:
      recordStr(o, "companyName", "CompanyName") ??
      recordStr(o, "vendorName", "VendorName"),
    categoryName: recordStr(o, "categoryName", "CategoryName"),
    amount:
      recordNum(o, "amount", "Amount") ??
      recordNum(o, "agreedPrice", "AgreedPrice") ??
      recordNum(o, "vendorOfferPrice", "VendorOfferPrice") ??
      recordNum(o, "price", "Price"),
  };
}

export function normalizeEventPlanBudgetSummary(
  raw: unknown,
): EventPlanBudgetSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const linesRaw =
    o.lines ??
    o.Lines ??
    o.budgetLines ??
    o.BudgetLines ??
    o.agreements ??
    o.Agreements ??
    o.acceptedOffers ??
    o.AcceptedOffers ??
    o.items ??
    o.Items;
  return {
    totalBudget:
      recordNum(o, "totalBudget", "TotalBudget") ??
      recordNum(o, "estimatedBudget", "EstimatedBudget") ??
      recordNum(o, "budgetMax", "BudgetMax"),
    totalSpent:
      recordNum(o, "totalSpent", "TotalSpent") ??
      recordNum(o, "spentTotal", "SpentTotal") ??
      recordNum(o, "totalAgreed", "TotalAgreed"),
    remainingBudget:
      recordNum(o, "remainingBudget", "RemainingBudget") ??
      recordNum(o, "remaining", "Remaining"),
    lines: Array.isArray(linesRaw)
      ? linesRaw.map(normalizeBudgetLine)
      : toList(linesRaw).map(normalizeBudgetLine),
  };
}

/** Seçili plan için kabul edilmiş teklifler (checklist eşlemesi). */
export async function getAgreements(
  planId: string | number,
): Promise<CustomerAgreement[]> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${planId}/agreements`,
  );
  assertSuccess(body);
  return toList(extractPayload(body.data))
    .map(normalizeCustomerAgreement)
    .filter((a) => a.id != null && a.isActive !== false);
}

/** Kabul edilmiş tekliflerden bütçe özeti. */
export async function getBudgetSummary(
  planId: string | number,
): Promise<EventPlanBudgetSummary> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${planId}/budget-summary`,
  );
  assertSuccess(body);
  return normalizeEventPlanBudgetSummary(extractPayload(body.data) ?? body.data);
}
