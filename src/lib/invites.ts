import type { EventGuest, EventPlan } from "@/src/lib/api/types";
import { SITE_URL } from "@/src/lib/site";

export const INVITE_SEND_TIMEOUT_MS = 25_000;

export const INVITE_SEND_TIMEOUT_MESSAGE =
  "Mail gönderimi uzun sürdü. Lütfen tekrar deneyin veya davet linkini kopyalayın.";

export function defaultInviteMessage(
  guestName: string,
  eventTitle: string,
): string {
  const guest = guestName.trim() || "Misafir";
  const event = eventTitle.trim() || "etkinliğimiz";
  return `Sayın ${guest}, ${event} etkinliğimize katılım durumunuzu bildirmenizi rica ederiz.`;
}

export function planDisplayTitle(plan: EventPlan | null): string {
  return plan?.title?.trim() || plan?.eventType?.trim() || "Etkinlik";
}

export function guestDisplayName(guest: EventGuest): string {
  return guest.fullName?.trim() || guest.name?.trim() || "Misafir";
}

export function isInviteSent(guest: EventGuest): boolean {
  if (guest.inviteSent === true || guest.isInviteSent === true) return true;
  return false;
}

export function isTicketSent(guest: EventGuest): boolean {
  if (guest.ticketSent === true || guest.isTicketSent === true) return true;
  return false;
}

export function guestRespondedAt(guest: EventGuest): string | undefined {
  return guest.respondedAt ?? guest.rsvpRespondedAt;
}

export function formatEventLocation(invite: {
  eventLocation?: string;
  city?: string;
  district?: string;
}): string {
  if (invite.eventLocation?.trim()) return invite.eventLocation.trim();
  return [invite.city, invite.district].filter(Boolean).join(" · ");
}

export function buildPublicEventInvitePath(token: string): string {
  return `/invite/event/${encodeURIComponent(token)}`;
}

export function buildPublicEventInviteUrl(token: string): string {
  const path = buildPublicEventInvitePath(token);
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return `${SITE_URL.replace(/\/$/, "")}${path}`;
}

/** Prefer API inviteUrl; otherwise build from token. */
export function resolvePublicInviteUrl(data: {
  inviteUrl?: string;
  token?: string;
}): string {
  const raw = data.inviteUrl?.trim();
  if (raw) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${raw.startsWith("/") ? raw : `/${raw}`}`;
    }
    return `${SITE_URL.replace(/\/$/, "")}${raw.startsWith("/") ? raw : `/${raw}`}`;
  }
  if (data.token?.trim()) {
    return buildPublicEventInviteUrl(data.token.trim());
  }
  return "";
}

export function shareInviteViaWhatsApp(inviteUrl: string, eventTitle?: string): void {
  const label = eventTitle?.trim() || "ORIVONA etkinliği";
  const text = encodeURIComponent(`${label} — davet linki:\n${inviteUrl}`);
  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
}

export function formatRespondedAt(iso?: string): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
