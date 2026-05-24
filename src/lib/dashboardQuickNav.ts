import type { UserRole } from "@/src/lib/api/types";
import { getDashboardPathForRole } from "@/src/lib/auth";

export type QuickNavItem = {
  label: string;
  /** Dashboard section id or external path */
  target: string;
  external?: boolean;
};

const CUSTOMER_LINKS: QuickNavItem[] = [
  { label: "Hesabım", target: "dashboard-account" },
  { label: "Etkinlik Planlarım", target: "event-os-plans" },
  { label: "Checklist", target: "event-os-checklist" },
  { label: "Davetliler", target: "event-os-guests" },
  { label: "Tekliflerim", target: "dashboard-offers" },
  { label: "Rezervasyonlarım", target: "dashboard-reservations" },
  { label: "Mesajlar", target: "dashboard-messages" },
  { label: "Bildirimler", target: "dashboard-notifications" },
  { label: "Favoriler", target: "dashboard-favorites" },
  { label: "AI Planlayıcı", target: "/ai-planner", external: true },
  { label: "Marketplace", target: "/marketplace", external: true },
];

const VENDOR_LINKS: QuickNavItem[] = [
  { label: "Hesabım", target: "dashboard-account" },
  { label: "Analitik", target: "dashboard-analytics" },
  { label: "CRM / Leadler", target: "dashboard-crm" },
  { label: "İşletme Profili", target: "dashboard-profile" },
  { label: "Hizmetlerim", target: "dashboard-services" },
  { label: "Gelen Teklifler", target: "dashboard-offers" },
  { label: "Rezervasyonlar", target: "dashboard-reservations" },
  { label: "Müsaitlik Takvimi", target: "dashboard-availability" },
  { label: "Mesajlar", target: "dashboard-messages" },
  { label: "Bildirimler", target: "dashboard-notifications" },
  { label: "Kuponlar", target: "dashboard-coupons" },
  { label: "Medya Galerisi", target: "dashboard-service-media" },
];

const ADMIN_LINKS: QuickNavItem[] = [
  { label: "Dashboard", target: "admin-summary" },
  { label: "İşletmeler", target: "admin-vendors" },
  { label: "Kullanıcılar", target: "admin-users" },
  { label: "Kategoriler", target: "admin-categories" },
  { label: "Kampanyalar", target: "admin-campaigns" },
  { label: "Kuponlar", target: "admin-coupons" },
  { label: "Promosyonlar", target: "admin-promotions" },
  { label: "Bildirimler", target: "admin-notifications" },
];

export function getQuickNavItems(role: UserRole | null): QuickNavItem[] {
  if (role === "Vendor") return VENDOR_LINKS;
  if (role === "Admin") return ADMIN_LINKS;
  if (role === "Customer") return CUSTOMER_LINKS;
  return [];
}

export function quickNavHref(
  role: UserRole | null,
  item: QuickNavItem,
): string {
  if (item.external || item.target.startsWith("/")) {
    return item.target;
  }
  const base = getDashboardPathForRole(role ?? "Customer");
  return `${base}#${item.target}`;
}
