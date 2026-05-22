import type { DashboardSummary } from "@/src/lib/api/types";
import { formatDashboardValue } from "@/src/lib/dashboardLabels";

/** Admin summary metrics in display order (supports PascalCase API keys). */
export const ADMIN_SUMMARY_METRICS: { keys: string[]; label: string }[] = [
  { keys: ["totalCustomers", "TotalCustomers"], label: "Toplam müşteri" },
  { keys: ["totalVendors", "TotalVendors"], label: "Toplam işletme" },
  {
    keys: [
      "pendingVendorApprovals",
      "PendingVendorApprovals",
      "pendingVendors",
      "PendingVendors",
    ],
    label: "Bekleyen işletme",
  },
  { keys: ["totalServices", "TotalServices"], label: "Toplam hizmet" },
  { keys: ["activeServices", "ActiveServices"], label: "Aktif hizmet" },
  {
    keys: ["totalOfferRequests", "TotalOfferRequests"],
    label: "Toplam teklif talebi",
  },
  { keys: ["totalReservations", "TotalReservations"], label: "Toplam rezervasyon" },
  {
    keys: ["estimatedRevenue", "EstimatedRevenue"],
    label: "Tahmini gelir",
  },
];

export function pickSummaryValue(
  summary: DashboardSummary | null | undefined,
  keys: string[],
): number | string | undefined {
  if (!summary) return undefined;
  for (const key of keys) {
    const v = summary[key];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

export function formatAdminSummaryValue(
  keys: string[],
  value: number | string | undefined,
): string {
  const primaryKey = keys[0];
  return formatDashboardValue(primaryKey, value);
}

export function formatAdminDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const slice = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) return value;
  try {
    return new Date(slice + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return slice;
  }
}

export function vendorApprovalLabel(vendor: {
  isApproved?: boolean;
  status?: string | null;
}): string {
  if (vendor.isApproved === true) return "Onaylı";
  const s = (vendor.status ?? "").trim().toLowerCase();
  if (s === "rejected" || s === "reddedildi") return "Reddedildi";
  if (s === "pending" || s === "bekliyor") return "Onay bekliyor";
  return "Onay bekliyor";
}

export function vendorCanModerate(vendor: {
  isApproved?: boolean;
  status?: string | null;
}): boolean {
  if (vendor.isApproved === true) return false;
  const s = (vendor.status ?? "").trim().toLowerCase();
  return s !== "rejected" && s !== "reddedildi";
}
