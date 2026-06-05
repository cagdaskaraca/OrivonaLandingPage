import type {
  CustomerAgreement,
  EventPlanBudgetLine,
  EventPlanBudgetSummary,
  EventTask,
} from "@/src/lib/api/types";
import { normalizeStatusKey } from "@/src/lib/statusLabels";

const tryCurrency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function formatTryCurrency(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return tryCurrency.format(amount);
}

/** @deprecated use formatTryCurrency */
export const formatTurkishLira = formatTryCurrency;

export function formatAgreementDate(value?: string): string | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

import { getStatusLabel } from "@/src/lib/statusLabels";

export function formatAgreementStatus(status?: string): string {
  if (!status?.trim()) return getStatusLabel("AcceptedByCustomer");
  return getStatusLabel(status, "customer");
}

export function normalizeCategoryKey(value?: string | null): string {
  return (value ?? "").trim().toLocaleLowerCase("tr-TR");
}

function categoryKeysForTask(task: EventTask): string[] {
  const keys = new Set<string>();
  for (const raw of [task.categoryName, task.title]) {
    const k = normalizeCategoryKey(raw);
    if (k) keys.add(k);
  }
  return [...keys];
}

function categoryKeysForAgreement(agreement: CustomerAgreement): string[] {
  const keys = new Set<string>();
  for (const raw of [
    agreement.category,
    agreement.categoryName,
    agreement.serviceType,
  ]) {
    const k = normalizeCategoryKey(raw);
    if (k) keys.add(k);
  }
  return [...keys];
}

export function categoriesMatch(taskKey: string, agreementKey: string): boolean {
  if (taskKey === agreementKey) return true;
  if (taskKey.length >= 3 && agreementKey.length >= 3) {
    return taskKey.includes(agreementKey) || agreementKey.includes(taskKey);
  }
  return false;
}

const ACTIVE_AGREEMENT_STATUSES = new Set([
  "acceptedbycustomer",
  "customeraccepted",
  "accepted",
  "active",
  "confirmed",
  "completed",
]);

const INACTIVE_AGREEMENT_STATUSES = new Set([
  "cancelled",
  "canceled",
  "cancelledbycustomer",
  "superseded",
  "replaced",
  "rejected",
  "rejectedbycustomer",
  "rejectedbyvendor",
  "expired",
]);

export function isActiveAgreement(agreement: CustomerAgreement): boolean {
  const status = normalizeStatusKey(agreement.status);
  if (!status) return true;
  if (INACTIVE_AGREEMENT_STATUSES.has(status)) return false;
  return ACTIVE_AGREEMENT_STATUSES.has(status);
}

function agreementDedupeKey(agreement: CustomerAgreement): string {
  const category =
    normalizeCategoryKey(
      agreement.category ?? agreement.categoryName ?? agreement.serviceType,
    ) || "genel";
  const vendor = normalizeCategoryKey(agreement.vendorName) || "isletme";
  return `${category}::${vendor}`;
}

function budgetLineDedupeKey(line: EventPlanBudgetLine): string {
  const category =
    normalizeCategoryKey(line.category ?? line.categoryName ?? line.serviceType) ||
    "genel";
  const vendor = normalizeCategoryKey(line.vendorName) || "isletme";
  return `${category}::${vendor}`;
}

function agreementRecency(agreement: CustomerAgreement): number {
  const date = agreement.agreementDate?.trim();
  if (date) {
    const ts = Date.parse(date);
    if (!Number.isNaN(ts)) return ts;
  }
  const id = agreement.id;
  if (typeof id === "number") return id;
  if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
  return 0;
}

function budgetLineRecency(line: EventPlanBudgetLine): number {
  const date = line.agreementDate?.trim();
  if (date) {
    const ts = Date.parse(date);
    if (!Number.isNaN(ts)) return ts;
  }
  const id = line.id;
  if (typeof id === "number") return id;
  if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
  return 0;
}

/** Aynı kategori+işletme için yalnızca en güncel aktif anlaşmayı tutar. */
export function dedupeActiveAgreementsByCategory(
  agreements: CustomerAgreement[],
): CustomerAgreement[] {
  const latest = new Map<string, CustomerAgreement>();
  for (const agreement of agreements) {
    if (!isActiveAgreement(agreement)) continue;
    const key = agreementDedupeKey(agreement);
    const existing = latest.get(key);
    if (
      !existing ||
      agreementRecency(agreement) >= agreementRecency(existing)
    ) {
      latest.set(key, agreement);
    }
  }
  return [...latest.values()].sort(
    (a, b) => agreementRecency(b) - agreementRecency(a),
  );
}

export function categoriesOverlap(
  categoryA?: string | null,
  categoryB?: string | null,
): boolean {
  const a = normalizeCategoryKey(categoryA);
  const b = normalizeCategoryKey(categoryB);
  if (!a || !b) return false;
  return categoriesMatch(a, b);
}

/** Seçili kategori için etkinlikte aktif (kabul edilmiş) teklif var mı? */
export function findActiveAgreementForCategory(
  agreements: CustomerAgreement[],
  category?: string | null,
): CustomerAgreement | undefined {
  const target = normalizeCategoryKey(category);
  if (!target) return undefined;
  return dedupeActiveAgreementsByCategory(agreements).find((agreement) => {
    const keys = categoryKeysForAgreement(agreement);
    return keys.some((key) => categoriesMatch(target, key));
  });
}

export function hasActiveAgreementForCategory(
  agreements: CustomerAgreement[],
  category?: string | null,
): boolean {
  return findActiveAgreementForCategory(agreements, category) != null;
}

/** Bütçe özetinde çift sayımı önler; harcama toplamını yeniden hesaplar. */
export function dedupeBudgetSummary(
  summary: EventPlanBudgetSummary,
): EventPlanBudgetSummary {
  const lines = summary.items ?? summary.lines ?? [];
  const latest = new Map<string, EventPlanBudgetLine>();
  for (const line of lines) {
    const key = budgetLineDedupeKey(line);
    const existing = latest.get(key);
    if (!existing || budgetLineRecency(line) >= budgetLineRecency(existing)) {
      latest.set(key, line);
    }
  }
  const deduped = [...latest.values()].sort(
    (a, b) => budgetLineRecency(b) - budgetLineRecency(a),
  );
  const spent = deduped.reduce(
    (sum, line) => sum + (line.agreedPrice ?? line.amount ?? 0),
    0,
  );
  const totalBudget = summary.totalBudget;
  return {
    ...summary,
    items: deduped,
    lines: deduped,
    spentBudget: spent,
    totalSpent: spent,
    remainingBudget:
      totalBudget != null ? Math.max(0, totalBudget - spent) : summary.remainingBudget,
  };
}

/** Checklist maddesini category / serviceType ile kabul edilmiş teklife bağlar. */
export function agreementForTaskCategory(
  agreements: CustomerAgreement[],
  task: EventTask,
): CustomerAgreement | undefined {
  const taskKeys = categoryKeysForTask(task);
  if (taskKeys.length === 0) return undefined;

  return agreements.find((agreement) => {
    const agreementKeys = categoryKeysForAgreement(agreement);
    return taskKeys.some((tk) =>
      agreementKeys.some((ak) => categoriesMatch(tk, ak)),
    );
  });
}

export function formatBudgetLineLabel(line: EventPlanBudgetLine): string {
  const category = line.category?.trim() || line.categoryName?.trim();
  const vendor = line.vendorName?.trim();
  if (category && vendor) return `${category} - ${vendor}`;
  return category || vendor || "Kalem";
}

export function formatBudgetLineDisplay(line: EventPlanBudgetLine): string {
  const amount = line.agreedPrice ?? line.amount;
  return `${formatBudgetLineLabel(line)}: ${formatTryCurrency(amount)}`;
}

export function formatPlanOptionLabel(
  title?: string,
  eventDate?: string,
): string {
  const name = title?.trim() || "Etkinlik planı";
  if (!eventDate?.trim()) return name;
  const formatted = formatAgreementDate(eventDate);
  return formatted ? `${name} · ${formatted}` : name;
}
