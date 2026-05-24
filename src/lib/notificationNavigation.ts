/** Resolve notification actionUrl to in-app routes with dashboard section hashes. */

const HASH_ALIASES: Record<string, string> = {
  businesses: "isletmeler",
  business: "isletmeler",
  isletme: "isletmeler",
  "how-it-works": "nasil-calisir",
  howitworks: "nasil-calisir",
  contact: "iletisim",
  messages: "dashboard-messages",
  message: "dashboard-messages",
  mesajlar: "dashboard-messages",
  offers: "dashboard-offers",
  offer: "dashboard-offers",
  teklifler: "dashboard-offers",
  tekliflerim: "dashboard-offers",
  reservations: "dashboard-reservations",
  reservation: "dashboard-reservations",
  rezervasyonlar: "dashboard-reservations",
  rezervasyonlarim: "dashboard-reservations",
  guests: "event-os-guests",
  guest: "event-os-guests",
  davetliler: "event-os-guests",
  rsvp: "event-os-rsvp",
  notifications: "dashboard-notifications",
  services: "dashboard-services",
  hizmetler: "dashboard-services",
  "event-plans": "event-os-plans",
  eventplans: "event-os-plans",
  etkinlikplanlari: "event-os-plans",
  checklist: "event-os-checklist",
  availability: "dashboard-availability",
  analytics: "dashboard-analytics",
  crm: "dashboard-crm",
};

export type ResolvedNotificationLink = {
  pathname: string;
  hash: string;
  href: string;
};

/** Map #messages / #offers aliases to dashboard section element ids. */
export function hashToSectionId(raw: string): string {
  const key = raw.replace(/^#/, "").trim().toLowerCase();
  if (!key) return "";
  return HASH_ALIASES[key] ?? raw.replace(/^#/, "");
}

/** Parse actionUrl from API (absolute or relative). */
export function resolveNotificationActionUrl(
  actionUrl: string,
  baseOrigin = "http://localhost",
): ResolvedNotificationLink | null {
  const trimmed = actionUrl.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed, baseOrigin);
    const pathname = url.pathname || "/";
    const sectionId = hashToSectionId(url.hash);
    const hash = sectionId ? `#${sectionId}` : "";
    return { pathname, hash, href: `${pathname}${hash}` };
  } catch {
    if (trimmed.startsWith("#")) {
      const sectionId = hashToSectionId(trimmed);
      return {
        pathname: "/",
        hash: sectionId ? `#${sectionId}` : "",
        href: sectionId ? `/#${sectionId}` : "/",
      };
    }
    if (trimmed.startsWith("/")) {
      const hashIdx = trimmed.indexOf("#");
      const pathname = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
      const hashPart = hashIdx >= 0 ? trimmed.slice(hashIdx) : "";
      const sectionId = hashToSectionId(hashPart);
      const hash = sectionId ? `#${sectionId}` : "";
      return { pathname, hash, href: `${pathname}${hash}` };
    }
    return null;
  }
}
