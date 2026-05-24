"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CustomerAuthPromptModal } from "@/src/components/auth/CustomerAuthPromptModal";
import type { CustomerAuthPromptReason } from "@/src/components/auth/CustomerAuthPromptModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { buildReturnUrlFromLocation, getSafeReturnUrl } from "@/src/lib/authRedirect";
import type { UserRole } from "@/src/lib/api/types";

type UseCustomerActionGuardOptions = {
  /** Override auto-detected return path (e.g. `/services/123`). */
  returnPath?: string;
};

export function useCustomerActionGuard(options: UseCustomerActionGuardOptions = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, role, loading } = useAuth();
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptReason, setPromptReason] =
    useState<CustomerAuthPromptReason>("login");

  const returnUrl = useMemo(() => {
    if (options.returnPath) {
      return getSafeReturnUrl(options.returnPath) ?? options.returnPath;
    }
    const query = searchParams.toString();
    const fromRouter = `${pathname}${query ? `?${query}` : ""}`;
    return getSafeReturnUrl(fromRouter) ?? fromRouter;
  }, [options.returnPath, pathname, searchParams]);

  const canPerformCustomerAction =
    !loading && isAuthenticated && role === "Customer";

  const requireCustomerAction = useCallback((): boolean => {
    if (loading) return false;
    if (!isAuthenticated) {
      setPromptReason("login");
      setPromptOpen(true);
      return false;
    }
    if (role !== "Customer") {
      setPromptReason("wrong_role");
      setPromptOpen(true);
      return false;
    }
    return true;
  }, [isAuthenticated, loading, role]);

  const authPromptModal = (
    <CustomerAuthPromptModal
      open={promptOpen}
      reason={promptReason}
      returnUrl={returnUrl}
      onClose={() => setPromptOpen(false)}
    />
  );

  return {
    loading,
    isAuthenticated,
    role: role as UserRole | null,
    canPerformCustomerAction,
    requireCustomerAction,
    authPromptModal,
    returnUrl,
    buildReturnUrlFromLocation,
  };
}
