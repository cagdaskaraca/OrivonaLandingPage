import type { EventGuest, EventPlan } from "@/src/lib/api/types";

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
