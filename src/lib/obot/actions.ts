import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  navigateToResolvedLink,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";
import type { OBotAction } from "@/src/lib/obot/types";

export const OBOT_ACTIONS: Record<string, OBotAction> = {
  "create-event": {
    id: "create-event",
    label: "Etkinlik oluştur",
    href: "/customer/dashboard",
    sectionId: "event-os-plans",
    scrollTargetId: "event-os-plans-new",
  },
  "ai-planner": {
    id: "ai-planner",
    label: "AI Planlayıcı",
    href: "/ai-planner",
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace'e git",
    href: "/marketplace",
  },
  "request-offer": {
    id: "request-offer",
    label: "Tekliflerim",
    href: "/customer/dashboard",
    sectionId: "dashboard-offers",
  },
  "event-requests": {
    id: "event-requests",
    label: "Etkinlik Talepleri",
    href: "/customer/dashboard",
    sectionId: "dashboard-events",
  },
  checklist: {
    id: "checklist",
    label: "Checklist",
    href: "/customer/dashboard",
    sectionId: "event-os-checklist",
  },
  seating: {
    id: "seating",
    label: "Masa planı",
    href: "/customer/dashboard",
    sectionId: "event-os-seating",
  },
  "invitation-design": {
    id: "invitation-design",
    label: "Davetiye tasarla",
    href: "/customer/dashboard",
    sectionId: "event-os-invitation-design",
  },
  messages: {
    id: "messages",
    label: "Mesajlar",
    href: "/customer/dashboard",
    sectionId: "dashboard-messages",
  },
  guests: {
    id: "guests",
    label: "Davetliler",
    href: "/customer/dashboard",
    sectionId: "event-os-guests",
  },
  "public-invite": {
    id: "public-invite",
    label: "Ortak davet linki",
    href: "/customer/dashboard",
    sectionId: "event-os-public-invite",
  },
  favorites: {
    id: "favorites",
    label: "Favorilerim",
    href: "/customer/dashboard",
    sectionId: "dashboard-favorites",
  },
  reservations: {
    id: "reservations",
    label: "Rezervasyonlarım",
    href: "/customer/dashboard",
    sectionId: "dashboard-reservations",
  },
  login: { id: "login", label: "Giriş yap", href: "/login" },
  register: { id: "register", label: "Kayıt ol", href: "/register" },
  "vendor-services": {
    id: "vendor-services",
    label: "Hizmetlerim",
    href: "/vendor/dashboard",
    sectionId: "dashboard-services",
  },
  "vendor-offers": {
    id: "vendor-offers",
    label: "Teklif talepleri",
    href: "/vendor/dashboard",
    sectionId: "dashboard-offers",
  },
  "vendor-availability": {
    id: "vendor-availability",
    label: "Müsaitlik takvimi",
    href: "/vendor/dashboard",
    sectionId: "dashboard-availability",
  },
  "vendor-profile": {
    id: "vendor-profile",
    label: "İşletme profili",
    href: "/vendor/dashboard",
    sectionId: "dashboard-profile",
  },
  "vendor-messages": {
    id: "vendor-messages",
    label: "Mesajlar",
    href: "/vendor/dashboard",
    sectionId: "dashboard-messages",
  },
  "vendor-crm": {
    id: "vendor-crm",
    label: "İşletme CRM",
    href: "/vendor/dashboard",
    sectionId: "dashboard-crm",
  },
  "vendor-analytics": {
    id: "vendor-analytics",
    label: "Analitik",
    href: "/vendor/dashboard",
    sectionId: "dashboard-analytics",
  },
  "admin-dashboard": {
    id: "admin-dashboard",
    label: "Admin paneli",
    href: "/admin/dashboard",
  },
  faq: { id: "faq", label: "SSS sayfası", href: "/faq" },
};

const CUSTOMER_DASHBOARD_PREFIX = "/customer/dashboard";

function normLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveActionIdByLabel(label: string): string | undefined {
  const n = normLabel(label);
  if (
    n.includes("etkinlik") &&
    (n.includes("olustur") || n.includes("plan") || n.includes("planlar"))
  ) {
    return "create-event";
  }
  if (n.includes("ai") && n.includes("plan")) return "ai-planner";
  if (n.includes("marketplace") || n.includes("pazar")) return "marketplace";
  if (n.includes("teklif") && n.includes("nasil")) return "marketplace";
  if (n.includes("teklif")) return "request-offer";
  if (n.includes("qr") || n.includes("davetiye")) {
    if (n.includes("tasar")) return "invitation-design";
    return "public-invite";
  }
  if (n.includes("misafir") || n.includes("davetli")) return "guests";
  if (n.includes("masa")) return "seating";
  if (n.includes("checklist")) return "checklist";
  if (n.includes("mesaj")) return "messages";
  if (n.includes("favori")) return "favorites";
  if (n.includes("rezervasyon")) return "reservations";
  if (n.includes("giris") || n.includes("login")) return "login";
  if (n.includes("kayit")) return "register";
  return undefined;
}

export function isCustomerDashboardAction(action: OBotAction): boolean {
  if (!action.href?.startsWith(CUSTOMER_DASHBOARD_PREFIX)) return false;
  return Boolean(action.sectionId);
}

export function requiresCustomerAuth(action: OBotAction): boolean {
  if (action.id === "login" || action.id === "register") return false;
  if (action.href === "/ai-planner" || action.href === "/marketplace") {
    return false;
  }
  if (action.href === "/faq") return false;
  return isCustomerDashboardAction(action);
}

export function resolveObotAction(
  partial: Partial<OBotAction> & { label: string },
): OBotAction {
  const byId =
    partial.id && OBOT_ACTIONS[partial.id]
      ? { ...OBOT_ACTIONS[partial.id], ...partial, label: partial.label }
      : null;

  if (byId) return byId;

  const labelId = resolveActionIdByLabel(partial.label);
  if (labelId && OBOT_ACTIONS[labelId]) {
    return { ...OBOT_ACTIONS[labelId], ...partial, label: partial.label };
  }

  return {
    id: partial.id ?? partial.label.toLowerCase().replace(/\s+/g, "-"),
    label: partial.label,
    href: partial.href,
    sectionId: partial.sectionId,
    scrollTargetId: partial.scrollTargetId,
  };
}

export function executeObotAction(
  router: AppRouterInstance,
  action: OBotAction,
  options?: { closePanel?: () => void },
): void {
  const resolved =
    action.id && OBOT_ACTIONS[action.id]
      ? { ...OBOT_ACTIONS[action.id], ...action }
      : resolveObotAction(action);

  const href = resolved.href ?? "";
  const sectionId = resolved.sectionId?.replace(/^#/, "") ?? "";
  const hash = sectionId ? `#${sectionId}` : "";
  const scrollTargetId = resolved.scrollTargetId?.replace(/^#/, "");

  const afterSectionScroll = () => {
    options?.closePanel?.();
    if (scrollTargetId) {
      window.setTimeout(() => {
        scrollToHashWhenReady(`#${scrollTargetId}`, {
          highlight: true,
          forceSameHash: true,
          updateHash: false,
        });
      }, 500);
    }
  };

  if (href && sectionId) {
    if (typeof window !== "undefined") {
      const pathname = href.split("#")[0] || href;
      const samePath =
        window.location.pathname.replace(/\/$/, "") ===
        pathname.replace(/\/$/, "");
      if (samePath) {
        scrollToHashWhenReady(`#${sectionId}`, {
          highlight: true,
          forceSameHash: true,
          updateHash: true,
        });
        afterSectionScroll();
        return;
      }
    }
    navigateToResolvedLink(router, {
      pathname: href.split("#")[0] || href,
      hash,
      href: `${href}${hash}`,
    });
    if (scrollTargetId) {
      window.setTimeout(() => {
        scrollToHashWhenReady(`#${scrollTargetId}`, {
          highlight: true,
          forceSameHash: true,
          updateHash: false,
        });
      }, 800);
    }
    options?.closePanel?.();
    return;
  }

  if (href) {
    router.push(href);
    options?.closePanel?.();
    return;
  }

  if (sectionId) {
    scrollToHashWhenReady(`#${sectionId}`, {
      highlight: true,
      forceSameHash: true,
      updateHash: true,
    });
    afterSectionScroll();
  }
}
