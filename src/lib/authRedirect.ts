import { consumeObotAfterAuthRedirect } from "@/src/lib/obot/obotRedirect";

/** Allow only same-origin relative paths for post-login redirect. */
export function getSafeReturnUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  if (p.includes("\n") || p.includes("\r")) return null;
  return p;
}

export function buildLoginUrl(returnUrl?: string | null): string {
  const safe = getSafeReturnUrl(returnUrl ?? undefined);
  if (!safe) return "/login";
  return `/login?returnUrl=${encodeURIComponent(safe)}`;
}

export function buildRegisterUrl(returnUrl?: string | null): string {
  const safe = getSafeReturnUrl(returnUrl ?? undefined);
  if (!safe) return "/register";
  return `/register?returnUrl=${encodeURIComponent(safe)}`;
}

export function buildReturnUrlFromLocation(): string {
  if (typeof window === "undefined") return "/marketplace";
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
}

/** Login/register sonrası: query returnUrl, ardından OBot pending redirect. */
export function resolvePostAuthRedirectUrl(
  queryReturnUrl: string | null | undefined,
): string | null {
  const fromQuery = getSafeReturnUrl(queryReturnUrl ?? undefined);
  if (fromQuery) return fromQuery;
  return consumeObotAfterAuthRedirect();
}
