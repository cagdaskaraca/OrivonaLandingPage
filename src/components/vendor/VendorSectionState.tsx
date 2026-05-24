"use client";

import type { ReactNode } from "react";
import { VENDOR_LOADING_MESSAGE } from "@/src/lib/api/vendorDashboardFetch";
import { btnSecondary } from "@/src/lib/ui";

type VendorSectionStateProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  empty?: ReactNode;
  children: ReactNode;
};

export function VendorSectionState({
  loading = false,
  error = null,
  onRetry,
  isEmpty = false,
  empty,
  children,
}: VendorSectionStateProps) {
  if (loading) {
    return (
      <p className="animate-pulse text-sm text-zinc-500">{VENDOR_LOADING_MESSAGE}</p>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>{error}</p>
        {onRetry ? (
          <button
            type="button"
            className={`${btnSecondary} mt-3 px-4 py-2 text-xs`}
            onClick={() => void onRetry()}
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    );
  }

  if (isEmpty && empty) {
    return <>{empty}</>;
  }

  return <>{children}</>;
}
