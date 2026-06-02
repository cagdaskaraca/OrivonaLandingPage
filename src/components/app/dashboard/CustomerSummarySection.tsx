"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchCustomerDashboardSummary,
  fetchFavorites,
  fetchMyOfferRequests,
  fetchMyReservations,
} from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { DashboardSummary } from "@/src/lib/api/types";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import {
  CUSTOMER_DEFAULT_ZERO_SUMMARY,
  CUSTOMER_EMPTY_DATA_MESSAGE,
} from "@/src/lib/customerDashboard";
import { btnSecondary, skeletonClass } from "@/src/lib/ui";

function normalizeStatusKey(value?: string | null): string {
  return (value ?? "").trim().replace(/\s+/g, "").toLowerCase();
}

function isPendingOfferLike(status?: string | null): boolean {
  const s = normalizeStatusKey(status);
  return (
    s === "pending" ||
    s === "waiting" ||
    s === "offerreceived" ||
    s === "customerreview" ||
    s === "offersent" ||
    s === "pendingvendorresponse"
  );
}

function isCancelledReservation(status?: string | null): boolean {
  const s = normalizeStatusKey(status);
  return (
    s.includes("cancel") ||
    s.includes("iptal") ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "cancelledbycustomer"
  );
}

function isUpcomingDate(dateIso?: string | null): boolean {
  if (!dateIso?.trim()) return false;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d.getTime() >= now.getTime();
}

async function computeCustomerSummaryFallback(): Promise<DashboardSummary> {
  const [offers, reservations, favorites] = await Promise.all([
    fetchMyOfferRequests(),
    fetchMyReservations(),
    fetchFavorites(),
  ]);

  return {
    totalOfferRequests: offers.length,
    pendingOfferRequests: offers.filter((o) => isPendingOfferLike(o.status)).length,
    totalReservations: reservations.length,
    upcomingReservations: reservations.filter(
      (r) => !isCancelledReservation(r.status) && isUpcomingDate(r.eventDate),
    ).length,
    totalFavorites: favorites.length,
  };
}

export function CustomerSummarySection() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerDashboardSummary();
      // If summary endpoint is unavailable or returns empty defaults, fall back to counting
      // from existing endpoints so users don't see misleading zeros.
      const isAllZero =
        (data?.totalOfferRequests ?? 0) === 0 &&
        (data?.pendingOfferRequests ?? 0) === 0 &&
        (data?.totalReservations ?? 0) === 0 &&
        (data?.upcomingReservations ?? 0) === 0 &&
        (data?.totalFavorites ?? 0) === 0;
      if (isAllZero) {
        setSummary(await computeCustomerSummaryFallback());
      } else {
        setSummary(data);
      }
    } catch (e) {
      if (!isApiNotFound(e)) {
        logApiError("Customer dashboard summary", e);
      }
      try {
        setSummary(await computeCustomerSummaryFallback());
      } catch (fallbackErr) {
        logApiError("Customer dashboard summary fallback", fallbackErr);
        setSummary(CUSTOMER_DEFAULT_ZERO_SUMMARY);
        setError("Özet verileri şu an yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className={`${skeletonClass} h-24`} />;

  return (
    <div className="space-y-3">
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-amber-200/90">{error}</p>
          <button type="button" className={btnSecondary} onClick={() => void load()}>
            Yenile
          </button>
        </div>
      ) : null}
      <SummaryCards
        summary={summary ?? CUSTOMER_DEFAULT_ZERO_SUMMARY}
        loading={false}
        className="mb-0"
        emptyMessage={CUSTOMER_EMPTY_DATA_MESSAGE}
      />
    </div>
  );
}
