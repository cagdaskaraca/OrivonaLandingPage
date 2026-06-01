import type {
  CustomerAgreement,
  EventPlanBudgetLine,
  EventTask,
} from "@/src/lib/api/types";

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

const AGREEMENT_STATUS_LABELS: Record<string, string> = {
  customeraccepted: "Müşteri kabul etti",
  acceptedbycustomer: "Müşteri kabul etti",
  accepted: "Müşteri kabul etti",
};

export function formatAgreementStatus(status?: string): string {
  if (!status?.trim()) return "Müşteri kabul etti";
  const key = status.trim().replace(/\s+/g, "").toLowerCase();
  if (AGREEMENT_STATUS_LABELS[key]) return AGREEMENT_STATUS_LABELS[key];
  if (status === "CustomerAccepted") return "Müşteri kabul etti";
  return status.trim();
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

function categoriesMatch(taskKey: string, agreementKey: string): boolean {
  if (taskKey === agreementKey) return true;
  if (taskKey.length >= 3 && agreementKey.length >= 3) {
    return taskKey.includes(agreementKey) || agreementKey.includes(taskKey);
  }
  return false;
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
