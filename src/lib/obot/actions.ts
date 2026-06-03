import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  handleOBotAction,
  type HandleObotActionAuth,
  type HandleObotActionOptions,
} from "@/src/lib/obot/handleObotAction";
import { getObotRouteTarget, resolveObotActionKey } from "@/src/lib/obot/routes";
import type { OBotAction } from "@/src/lib/obot/types";
import type { HelpAssistantRole } from "@/src/lib/obot/types";

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
    label: "Teklif iste",
    href: "/customer/dashboard",
    sectionId: "dashboard-events",
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
  "table-plan": {
    id: "table-plan",
    label: "Masa Planı",
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
  "add-guests": {
    id: "add-guests",
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
  "invite-link": {
    id: "invite-link",
    label: "Ortak Davet Linki",
    href: "/customer/dashboard",
    sectionId: "event-os-public-invite",
  },
  "public-page": {
    id: "public-page",
    label: "Herkese Açık Sayfa",
    href: "/customer/dashboard",
    sectionId: "event-os-public-page",
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
  const key = resolveObotActionKey(partial);
  const byId =
    key && OBOT_ACTIONS[key]
      ? { ...OBOT_ACTIONS[key], ...partial, label: partial.label }
      : null;

  if (byId) return byId;

  return {
    id: partial.id ?? partial.label.toLowerCase().replace(/\s+/g, "-"),
    label: partial.label,
    href: partial.href,
    sectionId: partial.sectionId,
    scrollTargetId: partial.scrollTargetId,
  };
}

export function requiresCustomerAuth(action: OBotAction): boolean {
  const key = resolveObotActionKey(action);
  if (!key) return false;
  const target = getObotRouteTarget(key);
  return target?.requiresCustomerAuth ?? false;
}

/** @deprecated handleOBotAction kullanın */
export function isCustomerDashboardAction(_action: OBotAction): boolean {
  return requiresCustomerAuth(_action);
}

export function executeObotAction(
  router: AppRouterInstance,
  action: OBotAction,
  options?: {
    auth?: HandleObotActionAuth;
    onRequireAuth?: (targetUrl: string) => void;
  },
): void {
  const key = resolveObotActionKey(action);
  if (!key || !options?.auth) return;
  handleOBotAction(key, {
    router,
    auth: options.auth,
    onRequireAuth: options.onRequireAuth,
  });
}

export { handleOBotAction };
