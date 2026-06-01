import type { CustomerAgreement } from "@/src/lib/api/types";

/** Örn. 25.000 TL */
export function formatTurkishLira(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} TL`;
}

/** Örn. Fotoğrafçı ile anlaşıldı - 25.000 TL */
export function formatAgreementSummary(agreement: CustomerAgreement): string {
  const name = agreement.companyName?.trim() || "Firma";
  const price = formatTurkishLira(agreement.agreedPrice);
  return `${name} ile anlaşıldı - ${price}`;
}

export function agreementForTask(
  agreements: CustomerAgreement[],
  taskId: string | number | undefined,
): CustomerAgreement | undefined {
  if (taskId == null) return undefined;
  const key = String(taskId);
  return agreements.find(
    (a) =>
      a.taskId != null &&
      String(a.taskId) === key &&
      a.isActive !== false,
  );
}
