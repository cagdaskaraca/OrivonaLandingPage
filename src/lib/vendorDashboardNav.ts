import {
  Activity,
  BadgeCheck,
  Bell,
  Briefcase,
  Calendar,
  CalendarCheck,
  CircleHelp,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  QrCode,
  Settings,
  Star,
  Store,
  Tag,
} from "lucide-react";
import type { DashboardNavGroup } from "@/src/lib/dashboardNavTypes";

/** Vendor panel sidebar — maps to existing section ids only. */
export const VENDOR_DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    title: "BAŞLANGIÇ",
    items: [
      { id: "dashboard-summary", label: "Genel Bakış", icon: LayoutDashboard },
      { id: "dashboard-help", label: "Başlarken", icon: CircleHelp },
      { id: "dashboard-activity", label: "Son Aktiviteler", icon: Activity },
    ],
  },
  {
    title: "TEKLİFLER",
    items: [
      { id: "dashboard-offers", label: "Gelen Talepler", icon: Inbox },
      { id: "dashboard-pipeline", label: "Tekliflerim", icon: Tag },
      { id: "dashboard-reservations", label: "Rezervasyonlar", icon: CalendarCheck },
      { id: "dashboard-crm", label: "CRM / Leadler", icon: Tag },
    ],
  },
  {
    title: "HİZMETLER",
    items: [
      { id: "dashboard-services", label: "Hizmetlerim", icon: Briefcase },
      { id: "dashboard-availability", label: "Uygunluk / Takvim", icon: Calendar },
      { id: "dashboard-coupons", label: "Paketler / Fiyatlar", icon: Package },
      { id: "dashboard-heatmap", label: "Yoğunluk takvimi", icon: Calendar },
      { id: "dashboard-analytics", label: "Analitik", icon: LayoutDashboard },
      { id: "dashboard-checkin", label: "QR Check-in", icon: QrCode },
    ],
  },
  {
    title: "MÜŞTERİ İŞLERİ",
    items: [
      { id: "dashboard-messages", label: "Mesajlar", icon: MessageCircle },
    ],
  },
  {
    title: "İŞLETME PROFİLİ",
    items: [
      { id: "dashboard-profile", label: "Profilim", icon: Store },
      { id: "dashboard-service-media", label: "Galeri", icon: Image },
      { id: "dashboard-review-intel", label: "Yorumlar", icon: Star },
      { id: "dashboard-promotions", label: "Premium / Doğrulama", icon: BadgeCheck },
    ],
  },
  {
    title: "HESAP",
    items: [
      { id: "dashboard-notifications", label: "Bildirimler", icon: Bell },
      { id: "dashboard-account", label: "Ayarlar", icon: Settings },
      {
        id: "vendor-logout",
        label: "Çıkış",
        icon: LogOut,
        action: "logout",
      },
    ],
  },
];
