import { hashToSectionId } from "@/src/lib/notificationNavigation";
import type { ResolvedNotificationLink } from "@/src/lib/notificationNavigation";

/** Sticky dashboard header offset (matches .orivona-dashboard-anchor). */
export const DASHBOARD_SCROLL_OFFSET_PX = 120;

const HASH_SCROLL_RETRY_MS = [100, 300, 600, 1000, 1500] as const;
const HIGHLIGHT_MS = 1500;
const LAYOUT_STABLE_MAX_DELTA_PX = 6;
const LAYOUT_STABLE_FRAMES_REQUIRED = 2;

type RouterLike = {
  push: (href: string) => void;
};

type ScrollOptions = {
  highlight?: boolean;
  /** Re-scroll when hash is already in the URL (notification re-clicks). */
  forceSameHash?: boolean;
  updateHash?: boolean;
};

let pendingSectionId: string | null = null;
let scrollGeneration = 0;

export function setPendingHashScroll(sectionId: string): void {
  pendingSectionId = sectionId.replace(/^#/, "");
}

export function consumePendingHashScroll(): string | null {
  const id = pendingSectionId;
  pendingSectionId = null;
  return id;
}

export function peekPendingHashScroll(): string | null {
  return pendingSectionId;
}

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

function scrollElementIntoView(el: HTMLElement): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const top =
        window.scrollY +
        el.getBoundingClientRect().top -
        DASHBOARD_SCROLL_OFFSET_PX;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    });
  });
}

/**
 * Retry scroll until the target section exists and layout has settled
 * (height/position stops shifting after API-driven renders).
 */
export function scrollToHashWhenReady(
  hash: string,
  options?: ScrollOptions,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const sectionId = hashToSectionId(hash);
  if (!sectionId) return () => undefined;

  const gen = ++scrollGeneration;
  const highlight = options?.highlight ?? true;
  const forceSameHash = options?.forceSameHash ?? true;
  const updateHash = options?.updateHash ?? true;
  const baseUrl = `${window.location.pathname}${window.location.search}`;

  if (forceSameHash && window.location.hash.replace(/^#/, "") === sectionId) {
    history.replaceState(null, "", baseUrl);
  }

  let succeeded = false;
  let lastTop: number | null = null;
  let stableFrames = 0;

  const attempt = (force = false): boolean => {
    if (gen !== scrollGeneration || succeeded) return true;

    const el = document.getElementById(sectionId);
    if (!el) {
      lastTop = null;
      stableFrames = 0;
      return false;
    }

    const rect = el.getBoundingClientRect();
    if (rect.height <= 0 && el.offsetHeight <= 0) {
      lastTop = null;
      stableFrames = 0;
      return false;
    }

    const top = rect.top;
    if (
      lastTop != null &&
      Math.abs(top - lastTop) <= LAYOUT_STABLE_MAX_DELTA_PX
    ) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
    }
    lastTop = top;

    if (
      !force &&
      stableFrames < LAYOUT_STABLE_FRAMES_REQUIRED
    ) {
      return false;
    }

    scrollElementIntoView(el);
    if (highlight) applySectionHighlight(el);
    if (updateHash) {
      history.replaceState(null, "", `${baseUrl}#${sectionId}`);
    }
    succeeded = true;
    return true;
  };

  const timers: ReturnType<typeof setTimeout>[] = [];
  HASH_SCROLL_RETRY_MS.forEach((delay, index) => {
    const isLast = index === HASH_SCROLL_RETRY_MS.length - 1;
    timers.push(setTimeout(() => attempt(isLast), delay));
  });

  return () => {
    if (gen === scrollGeneration) scrollGeneration += 1;
    for (const t of timers) window.clearTimeout(t);
  };
}

/** @deprecated Prefer scrollToHashWhenReady — kept for existing imports. */
export function scrollToDashboardSection(
  sectionId: string,
  options?: ScrollOptions,
): void {
  scrollToHashWhenReady(`#${sectionId.replace(/^#/, "")}`, options);
}

/** Notify dashboards that async sections finished loading (re-run pending hash scroll). */
export function notifyDashboardLayoutReady(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("orivona-dashboard-layout-ready"));
}

/** Same-page hash navigation or cross-route push with pending scroll. */
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
      scrollToHashWhenReady(link.hash, {
        updateHash: true,
        highlight: true,
        forceSameHash: true,
      });
    }
    return;
  }

  if (sectionId) {
    setPendingHashScroll(sectionId);
  }
  router.push(link.href);
}
