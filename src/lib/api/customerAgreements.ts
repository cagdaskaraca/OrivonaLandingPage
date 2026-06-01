import {
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
} from "@/src/lib/api/client";
import { recordBool, recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  CustomerAgreement,
  CustomerAgreementFormPayload,
  CustomerAgreementUpdatePayload,
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
  return {
    id: recordId(o),
    eventPlanId:
      recordId(o, "eventPlanId", "EventPlanId") ??
      recordId(o, "planId", "PlanId"),
    taskId: recordId(o, "taskId", "TaskId"),
    companyName:
      recordStr(o, "companyName", "CompanyName") ??
      recordStr(o, "vendorName", "VendorName") ??
      recordStr(o, "firmName", "FirmName"),
    agreedPrice:
      recordNum(o, "agreedPrice", "AgreedPrice") ??
      recordNum(o, "price", "Price") ??
      recordNum(o, "amount", "Amount"),
    agreementDate:
      recordStr(o, "agreementDate", "AgreementDate") ??
      recordStr(o, "agreedAt", "AgreedAt"),
    note: recordStr(o, "note", "Note") ?? recordStr(o, "notes", "Notes"),
    isActive:
      recordBool(o, "isActive", "IsActive") ??
      (recordStr(o, "status", "Status")?.toLowerCase() === "active"
        ? true
        : recordStr(o, "status", "Status")?.toLowerCase() === "inactive"
          ? false
          : undefined),
  };
}

function normalizeBudgetLine(raw: unknown): EventPlanBudgetLine {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    agreementId: recordId(o),
    taskId: recordId(o, "taskId", "TaskId"),
    label:
      recordStr(o, "label", "Label") ??
      recordStr(o, "companyName", "CompanyName") ??
      recordStr(o, "categoryName", "CategoryName"),
    companyName:
      recordStr(o, "companyName", "CompanyName") ??
      recordStr(o, "vendorName", "VendorName"),
    categoryName: recordStr(o, "categoryName", "CategoryName"),
    amount:
      recordNum(o, "amount", "Amount") ??
      recordNum(o, "agreedPrice", "AgreedPrice") ??
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

function buildAgreementBody(
  payload: CustomerAgreementFormPayload | CustomerAgreementUpdatePayload,
  includeTaskId: boolean,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    companyName: payload.companyName.trim(),
    agreedPrice: payload.agreedPrice,
    agreementDate: payload.agreementDate.trim(),
    note: payload.note?.trim() ?? "",
  };
  if (includeTaskId && "taskId" in payload && payload.taskId != null) {
    body.taskId = payload.taskId;
  }
  return body;
}

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

export async function createAgreement(
  planId: string | number,
  payload: CustomerAgreementFormPayload,
): Promise<CustomerAgreement> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/agreements`,
    buildAgreementBody(payload, true),
  );
  assertSuccess(body);
  return normalizeCustomerAgreement(extractPayload(body.data) ?? body.data);
}

export async function updateAgreement(
  planId: string | number,
  agreementId: string | number,
  payload: CustomerAgreementUpdatePayload,
): Promise<CustomerAgreement> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${planId}/agreements/${agreementId}`,
    buildAgreementBody(payload, false),
  );
  assertSuccess(body);
  return normalizeCustomerAgreement(extractPayload(body.data) ?? body.data);
}

export async function deleteAgreement(
  planId: string | number,
  agreementId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${planId}/agreements/${agreementId}`,
  );
  assertSuccess(body);
}

export async function getBudgetSummary(
  planId: string | number,
): Promise<EventPlanBudgetSummary> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${planId}/budget-summary`,
  );
  assertSuccess(body);
  return normalizeEventPlanBudgetSummary(extractPayload(body.data) ?? body.data);
}
