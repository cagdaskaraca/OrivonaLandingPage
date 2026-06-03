/** Müşteri paneli section element id'leri (CustomerDashboardView ile uyumlu). */
export type ObotRouteTarget = {
  pathname: string;
  sectionId?: string;
  scrollTargetId?: string;
  requiresCustomerAuth: boolean;
};

export type ObotActionKey =
  | "create-event"
  | "ai-planner"
  | "request-offer"
  | "event-requests"
  | "add-guests"
  | "guests"
  | "table-plan"
  | "seating"
  | "invitation-design"
  | "invite-link"
  | "public-invite"
  | "public-page"
  | "checklist"
  | "marketplace"
  | "messages"
  | "favorites"
  | "reservations"
  | "login"
  | "register"
  | "faq"
  | "vendor-services"
  | "vendor-offers"
  | "vendor-availability"
  | "vendor-profile"
  | "vendor-messages"
  | "vendor-crm"
  | "vendor-analytics"
  | "admin-dashboard";

const CUSTOMER = "/customer/dashboard";

function customerSection(
  sectionId: string,
  scrollTargetId?: string,
): ObotRouteTarget {
  return {
    pathname: CUSTOMER,
    sectionId,
    scrollTargetId,
    requiresCustomerAuth: true,
  };
}

/** actionKey → hedef route/section */
export const OBOT_ROUTE_MAP: Record<string, ObotRouteTarget> = {
  "create-event": customerSection("event-os-plans", "event-os-plans-new"),
  "ai-planner": {
    pathname: "/ai-planner",
    requiresCustomerAuth: false,
  },
  "request-offer": customerSection("dashboard-events"),
  "event-requests": customerSection("dashboard-events"),
  "add-guests": customerSection("event-os-guests"),
  guests: customerSection("event-os-guests"),
  "table-plan": customerSection("event-os-seating"),
  seating: customerSection("event-os-seating"),
  "invitation-design": customerSection("event-os-invitation-design"),
  "invite-link": customerSection("event-os-public-invite"),
  "public-invite": customerSection("event-os-public-invite"),
  "public-page": customerSection("event-os-public-page"),
  checklist: customerSection("event-os-checklist"),
  marketplace: {
    pathname: "/marketplace",
    requiresCustomerAuth: false,
  },
  messages: customerSection("dashboard-messages"),
  favorites: customerSection("dashboard-favorites"),
  reservations: customerSection("dashboard-reservations"),
  login: { pathname: "/login", requiresCustomerAuth: false },
  register: { pathname: "/register", requiresCustomerAuth: false },
  faq: { pathname: "/faq", requiresCustomerAuth: false },
  "vendor-services": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-services",
    requiresCustomerAuth: false,
  },
  "vendor-offers": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-offers",
    requiresCustomerAuth: false,
  },
  "vendor-availability": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-availability",
    requiresCustomerAuth: false,
  },
  "vendor-profile": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-profile",
    requiresCustomerAuth: false,
  },
  "vendor-messages": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-messages",
    requiresCustomerAuth: false,
  },
  "vendor-crm": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-crm",
    requiresCustomerAuth: false,
  },
  "vendor-analytics": {
    pathname: "/vendor/dashboard",
    sectionId: "dashboard-analytics",
    requiresCustomerAuth: false,
  },
  "admin-dashboard": {
    pathname: "/admin/dashboard",
    requiresCustomerAuth: false,
  },
};

/** Önerilen soru metni → actionKey (doğrudan yönlendirme). */
export const OBOT_SUGGESTED_QUESTION_KEYS: Record<string, ObotActionKey> = {
  "Etkinlik nasıl oluştururum?": "create-event",
  "Teklif nasıl isterim?": "event-requests",
  "QR davetiye nasıl oluşturulur?": "invite-link",
  "AI Planlayıcı ne yapar?": "ai-planner",
  "Rezervasyon süreci nasıl işler?": "reservations",
  "Misafir listesi nasıl eklenir?": "add-guests",
};

export function resolveObotActionKey(
  partial: { id?: string; label?: string },
): string | undefined {
  if (partial.id && OBOT_ROUTE_MAP[partial.id]) return partial.id;
  if (partial.id === "public-invite") return "invite-link";
  if (partial.id === "seating") return "table-plan";
  if (partial.id === "guests") return "add-guests";

  const label = partial.label?.trim();
  if (!label) return partial.id;

  const byQuestion = OBOT_SUGGESTED_QUESTION_KEYS[label];
  if (byQuestion) return byQuestion;

  const n = label
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

  if (
    n.includes("etkinlik") &&
    (n.includes("olustur") || n.includes("plan"))
  ) {
    return "create-event";
  }
  if (n.includes("ai") && n.includes("plan")) return "ai-planner";
  if (n.includes("marketplace") || n.includes("pazar")) return "marketplace";
  if (n.includes("teklif") && n.includes("nasil")) return "event-requests";
  if (n.includes("teklif")) return "request-offer";
  if (n.includes("qr") || n.includes("davetiye")) {
    if (n.includes("tasar")) return "invitation-design";
    return "invite-link";
  }
  if (n.includes("misafir") || n.includes("davetli")) return "add-guests";
  if (n.includes("masa")) return "table-plan";
  if (n.includes("checklist")) return "checklist";
  if (n.includes("mesaj")) return "messages";
  if (n.includes("favori")) return "favorites";
  if (n.includes("rezervasyon")) return "reservations";
  if (n.includes("giris") || n.includes("login")) return "login";
  if (n.includes("kayit")) return "register";

  return partial.id;
}

export function getObotRouteTarget(actionKey: string): ObotRouteTarget | null {
  return OBOT_ROUTE_MAP[actionKey] ?? null;
}

export function buildObotTargetUrl(target: ObotRouteTarget): string {
  const hash = target.sectionId ? `#${target.sectionId}` : "";
  return `${target.pathname}${hash}`;
}
