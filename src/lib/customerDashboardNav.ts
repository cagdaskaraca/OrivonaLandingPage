import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  BellRing,
  Bookmark,
  Calendar,
  CheckSquare,
  FileText,
  Globe,
  Heart,
  Home,
  LayoutGrid,
  Link2,
  LogOut,
  MessageCircle,
  Music,
  Palette,
  PieChart,
  Store,
  Tag,
  User,
  Users,
} from "lucide-react";
import type {
  DashboardNavGroup,
  DashboardNavItem,
} from "@/src/lib/dashboardNavTypes";

export type CustomerNavItemDef = DashboardNavItem & {
  icon: LucideIcon;
};

export type CustomerNavGroupDef = {
  title: string;
  items: CustomerNavItemDef[];
};

const icon = {
  help: Home,
  plans: Calendar,
  guests: Users,
  seating: LayoutGrid,
  checklist: CheckSquare,
  invitation: Palette,
  invite: Link2,
  publicPage: Globe,
  marketplace: Store,
  events: FileText,
  offers: Tag,
  reservations: Bookmark,
  favorites: Heart,
  music: Music,
  reminders: Bell,
  rsvp: PieChart,
  messages: MessageCircle,
  notifications: BellRing,
  account: User,
  activity: Activity,
  logout: LogOut,
} as const;

/** Müşteri paneli sidebar grupları (DOM section id'leri ile birebir). */
export function buildCustomerDashboardNavGroups(options: {
  onLogout: () => void;
}): DashboardNavGroup[] {
  const groups: CustomerNavGroupDef[] = [
    {
      title: "Başlangıç",
      items: [
        { id: "dashboard-help", label: "Başlarken", icon: icon.help },
      ],
    },
    {
      title: "Etkinlik",
      items: [
        { id: "event-os-plans", label: "Etkinlik Planlarım", icon: icon.plans },
        { id: "event-os-guests", label: "Davetliler", icon: icon.guests },
        { id: "event-os-seating", label: "Masa Planı", icon: icon.seating },
        { id: "event-os-checklist", label: "Checklist", icon: icon.checklist },
      ],
    },
    {
      title: "Davetiye & Paylaşım",
      items: [
        {
          id: "event-os-invitation-design",
          label: "Davetiye Tasarımı",
          icon: icon.invitation,
        },
        {
          id: "event-os-public-invite",
          label: "Ortak Davet Linki",
          icon: icon.invite,
        },
        {
          id: "event-os-public-page",
          label: "Herkese Açık Sayfa",
          icon: icon.publicPage,
        },
      ],
    },
    {
      title: "Teklifler",
      items: [
        {
          id: "nav-marketplace",
          label: "Marketplace",
          href: "/marketplace",
          icon: icon.marketplace,
        },
        {
          id: "dashboard-events",
          label: "Etkinlik Talepleri",
          icon: icon.events,
        },
        { id: "dashboard-offers", label: "Tekliflerim", icon: icon.offers },
        {
          id: "dashboard-reservations",
          label: "Rezervasyonlarım",
          icon: icon.reservations,
        },
        { id: "dashboard-favorites", label: "Favoriler", icon: icon.favorites },
      ],
    },
    {
      title: "Ek Planlama",
      items: [
        {
          id: "event-os-playlist",
          label: "Müzik Tercihleri",
          icon: icon.music,
        },
        {
          id: "event-os-reminders",
          label: "Hatırlatmalar",
          icon: icon.reminders,
        },
        {
          id: "event-os-rsvp",
          label: "Katılım Durumu",
          icon: icon.rsvp,
        },
      ],
    },
    {
      title: "İletişim",
      items: [
        { id: "dashboard-messages", label: "Mesajlar", icon: icon.messages },
        {
          id: "dashboard-notifications",
          label: "Bildirimler",
          icon: icon.notifications,
        },
      ],
    },
    {
      title: "Hesap",
      items: [
        { id: "dashboard-account", label: "Hesabım", icon: icon.account },
        {
          id: "dashboard-activity",
          label: "Son Aktiviteler",
          icon: icon.activity,
        },
        {
          id: "nav-logout",
          label: "Çıkış",
          icon: icon.logout,
          onClick: options.onLogout,
        },
      ],
    },
  ];

  return groups;
}

/** Scroll spy sırası = ana sayfa section DOM sırası. */
export const CUSTOMER_SECTION_SCROLL_ORDER: string[] = [
  "dashboard-help",
  "event-os-plans",
  "event-os-guests",
  "event-os-seating",
  "event-os-checklist",
  "event-os-invitation-design",
  "event-os-public-invite",
  "event-os-public-page",
  "dashboard-events",
  "dashboard-offers",
  "dashboard-reservations",
  "dashboard-favorites",
  "event-os-playlist",
  "event-os-reminders",
  "event-os-rsvp",
  "dashboard-messages",
  "dashboard-notifications",
  "dashboard-account",
  "dashboard-activity",
];
