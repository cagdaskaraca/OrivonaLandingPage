import type { VendorLead, VendorLeadFunnelStage } from "@/src/lib/api/types";
import { maskFullName } from "@/src/lib/messaging";
import { getStatusLabel } from "@/src/lib/statusLabels";

/** Fixed UI copy for vendor dashboard sections (never show unrelated API errors). */
export const VENDOR_ANALYTICS_LOAD_ERROR =
  "Analitik veriler şu anda alınamadı.";
export const VENDOR_CRM_LOAD_ERROR = "CRM verileri şu anda alınamadı.";
export const VENDOR_PIPELINE_LOAD_ERROR = "Pipeline verileri şu anda alınamadı.";
export const VENDOR_EMPTY_DATA = "Henüz veri yok.";

export const LEAD_FUNNEL_STAGES = [
  { value: "New", label: "Yeni" },
  { value: "Contacted", label: "İletişime geçildi" },
  { value: "OfferSent", label: "Teklif verildi" },
  { value: "Won", label: "Kazanıldı" },
  { value: "Lost", label: "Kaybedildi" },
] as const;

export function leadStatusLabel(status?: string): string {
  const s = status?.trim();
  const found = LEAD_FUNNEL_STAGES.find(
    (x) => x.value.toLowerCase() === s?.toLowerCase(),
  );
  if (found) return found.label;
  if (!s) return "Yeni";
  return getStatusLabel(s, "vendor");
}

export function normalizeLeadStatusKey(status?: string): string {
  const s = status?.trim() ?? "New";
  const lower = s.toLowerCase().replace(/\s+/g, "");
  if (lower === "new" || lower === "yeni") return "New";
  if (lower === "contacted" || lower.includes("iletisim")) return "Contacted";
  if (lower === "offersent" || lower.includes("teklif")) return "OfferSent";
  if (lower === "won" || lower.includes("kazan")) return "Won";
  if (lower === "lost" || lower.includes("kayb")) return "Lost";
  return s;
}

export function maskLeadCustomerName(lead: VendorLead): string {
  const raw = lead.customerName?.trim();
  if (!raw) return "Müşteri";
  return maskFullName(raw);
}

export function buildFunnelCounts(
  leads: VendorLead[],
  apiStages?: VendorLeadFunnelStage[],
): { value: string; label: string; count: number }[] {
  if (apiStages?.length) {
    return LEAD_FUNNEL_STAGES.map((stage) => {
      const fromApi = apiStages.find(
        (s) =>
          normalizeLeadStatusKey(s.status) === stage.value ||
          s.label?.trim() === stage.label,
      );
      const fromLeads = leads.filter(
        (l) => normalizeLeadStatusKey(l.status) === stage.value,
      ).length;
      return {
        value: stage.value,
        label: stage.label,
        count: fromApi?.count ?? fromLeads,
      };
    });
  }
  return LEAD_FUNNEL_STAGES.map((stage) => ({
    ...stage,
    count: leads.filter(
      (l) => normalizeLeadStatusKey(l.status) === stage.value,
    ).length,
  }));
}

export function formatPercent(value?: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  const n = value <= 1 ? value * 100 : value;
  return `%${n.toFixed(1)}`;
}

export function formatTryAmount(value?: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("tr-TR")} ₺`;
}

export function formatResponseTime(
  summary?: { averageResponseTime?: string; averageResponseTimeMinutes?: number },
): string {
  if (summary?.averageResponseTime?.trim()) {
    return summary.averageResponseTime;
  }
  const mins = summary?.averageResponseTimeMinutes;
  if (mins == null) return "—";
  if (mins < 60) return `${Math.round(mins)} dk`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export function reviewListItems(summary: {
  positives?: string[];
  strengths?: string[];
  improvements?: string[];
  areasToImprove?: string[];
}): { positives: string[]; improvements: string[] } {
  return {
    positives: [
      ...(summary.positives ?? []),
      ...(summary.strengths ?? []),
    ].filter(Boolean),
    improvements: [
      ...(summary.improvements ?? []),
      ...(summary.areasToImprove ?? []),
    ].filter(Boolean),
  };
}
