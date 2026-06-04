import {
  Bell,
  Building2,
  Grid3x3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Store,
  Tag,
  Ticket,
  User,
  Users,
} from "lucide-react";
import type { DashboardNavGroup } from "@/src/lib/dashboardNavTypes";

/** Admin panel sidebar — section ids match AdminDashboardView DOM order. */
export const ADMIN_DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    title: "BAŞLANGIÇ",
    items: [
      { id: "admin-summary", label: "Genel Bakış", icon: LayoutDashboard },
      { id: "admin-activity", label: "Son Aktiviteler", icon: LayoutDashboard },
    ],
  },
  {
    title: "YÖNETİM",
    items: [
      { id: "admin-users", label: "Kullanıcılar", icon: Users },
      { id: "admin-vendors", label: "İşletmeler", icon: Building2 },
      { id: "admin-services", label: "Hizmetler", icon: Store },
      { id: "admin-categories", label: "Kategoriler", icon: Grid3x3 },
    ],
  },
  {
    title: "İÇERİK",
    items: [
      { id: "admin-notifications", label: "Bildirimler", icon: Bell },
      { id: "admin-campaigns", label: "Kampanyalar", icon: Megaphone },
      { id: "admin-coupons", label: "Kuponlar", icon: Ticket },
      { id: "admin-promotions", label: "Tanıtımlar", icon: Tag },
    ],
  },
  {
    title: "HESAP",
    items: [
      { id: "admin-account", label: "Profil", icon: User },
      {
        id: "admin-logout",
        label: "Çıkış",
        icon: LogOut,
        action: "logout",
      },
    ],
  },
];
