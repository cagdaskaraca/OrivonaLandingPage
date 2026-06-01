import type { CustomerAgreement, EventTask } from "@/src/lib/api/types";
import { formatOfferStatus } from "@/src/lib/offerRequest";

/** Örn. 10.000 TL */
export function formatTurkishLira(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} TL`;
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
    agreement.categoryName,
    agreement.serviceType,
    agreement.serviceCategoryName,
    agreement.serviceTitle,
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

/** Checklist maddesini kategori / serviceType ile kabul edilmiş teklife bağlar. */
export function agreementForTaskCategory(
  agreements: CustomerAgreement[],
  task: EventTask,
): CustomerAgreement | undefined {
  const taskKeys = categoryKeysForTask(task);
  if (taskKeys.length === 0) return undefined;

  if (task.id != null) {
    const byTask = agreements.find(
      (a) => a.taskId != null && String(a.taskId) === String(task.id),
    );
    if (byTask) return byTask;
  }

  return agreements.find((agreement) => {
    const agreementKeys = categoryKeysForAgreement(agreement);
    return taskKeys.some((tk) =>
      agreementKeys.some((ak) => categoriesMatch(tk, ak)),
    );
  });
}

export function agreementDisplayName(agreement: CustomerAgreement): string {
  return (
    agreement.companyName?.trim() ||
    agreement.vendorName?.trim() ||
    agreement.businessName?.trim() ||
    agreement.serviceTitle?.trim() ||
    "İşletme"
  );
}

export function agreementDisplayDescription(
  agreement: CustomerAgreement,
): string | undefined {
  const text =
    agreement.description?.trim() ||
    agreement.vendorOfferDescription?.trim() ||
    agreement.note?.trim();
  return text || undefined;
}

export function agreementDisplayStatus(agreement: CustomerAgreement): string {
  if (agreement.statusLabel?.trim()) return agreement.statusLabel.trim();
  if (agreement.status?.trim()) return formatOfferStatus(agreement.status);
  return "Müşteri kabul etti";
}

export function formatPlanOptionLabel(
  title?: string,
  eventDate?: string,
): string {
  const name = title?.trim() || "Etkinlik planı";
  if (!eventDate?.trim()) return name;
  const d = new Date(eventDate);
  if (Number.isNaN(d.getTime())) return `${name} · ${eventDate}`;
  const formatted = d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${name} · ${formatted}`;
}
