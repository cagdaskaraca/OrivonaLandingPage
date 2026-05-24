import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { OBotAction } from "@/src/lib/obot/types";

export const OBOT_ACTIONS: Record<string, OBotAction> = {
  "create-event": {
    id: "create-event",
    label: "Etkinlik Planlarım",
    href: "/customer/dashboard",
    sectionId: "event-os-plans",
  },
  "ai-planner": {
    id: "ai-planner",
    label: "AI Planlayıcıyı aç",
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

export function resolveObotAction(
  partial: Partial<OBotAction> & { label: string },
): OBotAction {
  if (partial.id && OBOT_ACTIONS[partial.id]) {
    return { ...OBOT_ACTIONS[partial.id], ...partial, label: partial.label };
  }
  return {
    id: partial.id ?? partial.label.toLowerCase().replace(/\s+/g, "-"),
    label: partial.label,
    href: partial.href,
    sectionId: partial.sectionId,
  };
}

export function executeObotAction(
  router: AppRouterInstance,
  action: OBotAction,
  options?: { closePanel?: () => void },
): void {
  const target = action.href ?? "";
  const hash = action.sectionId ? `#${action.sectionId}` : "";

  if (target) {
    const url = `${target}${hash}`;
    router.push(url);
    if (action.sectionId) {
      window.setTimeout(() => {
        document.getElementById(action.sectionId!)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 450);
    }
  } else if (action.sectionId) {
    document.getElementById(action.sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  options?.closePanel?.();
}
