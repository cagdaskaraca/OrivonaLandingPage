import type { DashboardSummary } from "@/src/lib/api/types";

/** Maps API summary keys to Turkish labels shown in dashboards. */
export const DASHBOARD_FIELD_LABELS: Record<string, string> = {
  totalServices: "Toplam hizmet",
  activeServices: "Aktif hizmet",
  totalOfferRequests: "Toplam teklif talebi",
  pendingOfferRequests: "Bekleyen teklifler",
  totalReservations: "Toplam rezervasyon",
  upcomingReservations: "Yaklaşan rezervasyon",
  totalViews: "Görüntülenme",
  conversionRate: "Dönüşüm oranı",
  estimatedRevenue: "Tahmini gelir",
  profileApprovalStatus: "Profil onay durumu",
  totalCustomers: "Toplam müşteri",
  totalVendors: "Toplam işletme",
  totalEventRequests: "Toplam etkinlik talebi",
  pendingVendorApprovals: "Bekleyen işletme onayı",
  totalUsers: "Toplam kullanıcı",
  totalFavorites: "Toplam favori",
  activeReservations: "Aktif rezervasyon",
  completedReservations: "Tamamlanan rezervasyon",
};

export function getDashboardLabel(key: string): string {
  if (DASHBOARD_FIELD_LABELS[key]) return DASHBOARD_FIELD_LABELS[key];
  const camel = key.replace(/([A-Z])/g, " $1").trim();
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function formatDashboardValue(
  key: string,
  value: string | number | undefined,
): string {
  if (value === undefined || value === null) return "—";

  if (key === "profileApprovalStatus") {
    const s = String(value).toLowerCase();
    if (s === "true" || s === "approved" || s === "onaylı" || s === "onayli") {
      return "Onaylı";
    }
    if (s === "false" || s === "pending" || s === "bekliyor") return "Onay bekliyor";
    if (s === "rejected" || s === "reddedildi") return "Reddedildi";
    return String(value);
  }

  if (key === "conversionRate" && typeof value === "number") {
    const pct = value <= 1 ? value * 100 : value;
    return `%${pct.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  }

  if (
    (key === "estimatedRevenue" ||
      key.includes("Revenue") ||
      key.includes("Price") ||
      key.includes("Budget")) &&
    typeof value === "number"
  ) {
    return `${value.toLocaleString("tr-TR")} ₺`;
  }

  if (typeof value === "number") {
    return value.toLocaleString("tr-TR");
  }

  return String(value);
}

export function summaryEntries(
  summary: DashboardSummary | null | undefined,
): { key: string; label: string; displayValue: string }[] {
  if (!summary) return [];
  return Object.entries(summary).map(([key, value]) => ({
    key,
    label: getDashboardLabel(key),
    displayValue: formatDashboardValue(key, value),
  }));
}
