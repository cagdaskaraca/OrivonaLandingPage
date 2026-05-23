const STORAGE_PREFIX = "orivona-event-invite-access:";

export function storeGuestAccessToken(
  eventToken: string,
  guestAccessToken: string,
): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${eventToken}`, guestAccessToken);
}

export function getGuestAccessToken(eventToken: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(`${STORAGE_PREFIX}${eventToken}`);
}

export function clearGuestAccessToken(eventToken: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(`${STORAGE_PREFIX}${eventToken}`);
}
