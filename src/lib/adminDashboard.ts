import type { DashboardSummary } from "@/src/lib/api/types";
import { normalizeRole } from "@/src/lib/auth";
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

export function vendorUserIsActive(vendor: {
  isUserActive?: boolean;
  isActive?: boolean;
}): boolean {
  if (vendor.isUserActive !== undefined) return vendor.isUserActive !== false;
  if (vendor.isActive !== undefined) return vendor.isActive !== false;
  return true;
}

export function vendorActiveLabel(vendor: {
  isUserActive?: boolean;
  isActive?: boolean;
}): string {
  return vendorUserIsActive(vendor) ? "Aktif" : "Pasif";
}

export function activeStatusClass(isActive: boolean | undefined): string {
  return isActive === false
    ? "border-zinc-500/40 bg-zinc-500/15 text-zinc-300"
    : "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";
}

export function userRoleLabel(role?: string | null): string {
  const normalized = normalizeRole(role ?? undefined);
  if (normalized === "Customer") return "Müşteri";
  if (normalized === "Vendor") return "İşletme";
  if (normalized === "Admin") return "Yönetici";
  const raw = (role ?? "").trim();
  return raw || "—";
}

export function formatAdminCategoryLabel(cat: {
  name?: string;
  serviceCount?: number;
}): string {
  const name = cat.name?.trim() || "—";
  const count = cat.serviceCount;
  if (count != null && count > 0) {
    return `${name} (${count} hizmet)`;
  }
  return name;
}

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
