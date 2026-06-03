import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  setPendingHashScroll,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";
import type { HelpAssistantRole } from "@/src/lib/obot/types";
import {
  buildObotTargetUrl,
  getObotRouteTarget,
  resolveObotActionKey,
} from "@/src/lib/obot/routes";
import {
  setObotAfterAuthRedirect,
  setObotFocusTarget,
} from "@/src/lib/obot/obotRedirect";

export type HandleObotActionAuth = {
  isAuthenticated: boolean;
  authRole: string | null | undefined;
  assistantRole: HelpAssistantRole;
};

export type HandleObotActionOptions = {
  router: AppRouterInstance;
  auth: HandleObotActionAuth;
  /** Giriş gerekli — modal veya login linki için hedef URL. */
  onRequireAuth?: (targetUrl: string) => void;
};

function isCustomerSession(auth: HandleObotActionAuth): boolean {
  return auth.isAuthenticated && auth.authRole === "Customer";
}

function needsCustomerLogin(
  actionKey: string,
  auth: HandleObotActionAuth,
): boolean {
  const target = getObotRouteTarget(actionKey);
  if (!target?.requiresCustomerAuth) return false;
  if (auth.assistantRole === "vendor" || auth.assistantRole === "admin") {
    return false;
  }
  return !isCustomerSession(auth);
}

function scheduleFocusScroll(scrollTargetId: string): void {
  window.setTimeout(() => {
    scrollToHashWhenReady(`#${scrollTargetId}`, {
      highlight: true,
      forceSameHash: true,
      updateHash: false,
      immediate: true,
    });
  }, 450);
}

function navigateToTarget(
  router: AppRouterInstance,
  actionKey: string,
): void {
  const target = getObotRouteTarget(actionKey);
  if (!target) return;

  const sectionId = target.sectionId?.replace(/^#/, "") ?? "";
  const scrollTargetId = target.scrollTargetId?.replace(/^#/, "");
  const href = buildObotTargetUrl(target);

  if (scrollTargetId) {
    setObotFocusTarget(scrollTargetId);
  }

  if (typeof window === "undefined") {
    router.push(href);
    return;
  }

  const pathname = target.pathname;
  const samePath =
    window.location.pathname.replace(/\/$/, "") ===
    pathname.replace(/\/$/, "");

  if (samePath && sectionId) {
    const base = `${window.location.pathname}${window.location.search}`;
    history.replaceState(null, "", base);
    scrollToHashWhenReady(`#${sectionId}`, {
      highlight: true,
      forceSameHash: true,
      updateHash: true,
      immediate: true,
    });
    if (scrollTargetId) {
      scheduleFocusScroll(scrollTargetId);
    }
    return;
  }

  if (sectionId) {
    setPendingHashScroll(sectionId);
  }
  router.push(href);
  if (scrollTargetId) {
    scheduleFocusScroll(scrollTargetId);
  }
}

/**
 * Merkezi OBot aksiyon handler — her tıklamada çalışır, stale guard yok.
 */
export function handleOBotAction(
  actionKeyOrPartial: string | { id?: string; label?: string },
  options: HandleObotActionOptions,
): boolean {
  const actionKey =
    typeof actionKeyOrPartial === "string"
      ? actionKeyOrPartial
      : resolveObotActionKey(actionKeyOrPartial);

  if (!actionKey) return false;

  const target = getObotRouteTarget(actionKey);
  if (!target) return false;

  const targetUrl = buildObotTargetUrl(target);
  const { router, auth, onRequireAuth } = options;

  if (actionKey === "login" || actionKey === "register") {
    router.push(target.pathname);
    return true;
  }

  if (needsCustomerLogin(actionKey, auth)) {
    setObotAfterAuthRedirect(targetUrl);
    if (target.scrollTargetId) {
      setObotFocusTarget(target.scrollTargetId);
    }
    onRequireAuth?.(targetUrl);
    return true;
  }

  navigateToTarget(router, actionKey);
  return true;
}
