import { getSafeReturnUrl } from "@/src/lib/authRedirect";

/** Post-login/register hedefi (tam path, hash ve query dahil). */
export const OBOT_AFTER_AUTH_KEY = "orivona_after_auth_redirect";

/** Bölüm içi ikinci scroll hedefi (ör. yeni plan formu). */
export const OBOT_FOCUS_KEY = "orivona_obot_focus_target";

export function setObotAfterAuthRedirect(url: string): void {
  if (typeof window === "undefined") return;
  const safe = getSafeReturnUrl(url);
  if (!safe) return;
  window.localStorage.setItem(OBOT_AFTER_AUTH_KEY, safe);
}

export function peekObotAfterAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  return getSafeReturnUrl(window.localStorage.getItem(OBOT_AFTER_AUTH_KEY));
}

export function consumeObotAfterAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(OBOT_AFTER_AUTH_KEY);
  window.localStorage.removeItem(OBOT_AFTER_AUTH_KEY);
  return getSafeReturnUrl(raw);
}

export function setObotFocusTarget(sectionId: string): void {
  if (typeof window === "undefined") return;
  const id = sectionId.replace(/^#/, "").trim();
  if (!id) return;
  window.sessionStorage.setItem(OBOT_FOCUS_KEY, id);
}

export function consumeObotFocusTarget(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(OBOT_FOCUS_KEY);
  window.sessionStorage.removeItem(OBOT_FOCUS_KEY);
  const id = raw?.replace(/^#/, "").trim();
  return id || null;
}
