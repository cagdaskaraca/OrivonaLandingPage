import type { ResolvedNotificationLink } from "@/src/lib/notificationNavigation";

const SCROLL_RETRY_MS = [0, 100, 300, 600] as const;
const HIGHLIGHT_MS = 1500;

type RouterLike = {
  push: (href: string) => void;
};

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path || "/";
}

function pathsMatch(a: string, b: string): boolean {
  return normalizePath(a) === normalizePath(b);
}

function applySectionHighlight(el: HTMLElement): void {
  el.classList.add("orivona-section-highlight");
  window.setTimeout(() => {
    el.classList.remove("orivona-section-highlight");
  }, HIGHLIGHT_MS);
}

/** Scroll to section with retries; safe if element is not yet mounted. */
export function scrollToDashboardSection(
  sectionId: string,
  options?: { highlight?: boolean; updateHash?: boolean },
): void {
  if (!sectionId || typeof window === "undefined") return;

  const highlight = options?.highlight ?? true;
  const updateHash = options?.updateHash ?? true;
  const baseUrl = `${window.location.pathname}${window.location.search}`;
  const currentHash = window.location.hash.replace(/^#/, "");

  if (updateHash && currentHash === sectionId) {
    history.replaceState(null, "", baseUrl);
  }

  let done = false;

  const attempt = (): boolean => {
    if (done) return true;
    const el = document.getElementById(sectionId);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (highlight) applySectionHighlight(el);
    if (updateHash) {
      history.replaceState(null, "", `${baseUrl}#${sectionId}`);
    }
    done = true;
    return true;
  };

  for (const delay of SCROLL_RETRY_MS) {
    window.setTimeout(() => attempt(), delay);
  }
}

/** Same-page hash navigation or cross-route push with hash. */
export function navigateToResolvedLink(
  router: RouterLike,
  link: ResolvedNotificationLink,
): void {
  if (typeof window === "undefined") {
    router.push(link.href);
    return;
  }

  const sectionId = link.hash.replace(/^#/, "");
  const samePath = pathsMatch(window.location.pathname, link.pathname);

  if (samePath) {
    if (sectionId) {
      scrollToDashboardSection(sectionId, { updateHash: true, highlight: true });
    }
    return;
  }

  router.push(link.href);
}
