"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  cancelReservation,
  fetchCustomerDashboardSummary,
  fetchFavorites,
  fetchMyReservations,
} from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type {
  DashboardSummary,
  FavoriteItem,
  Reservation,
} from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import {
  CUSTOMER_DEFAULT_ZERO_SUMMARY,
  CUSTOMER_EMPTY_DATA_MESSAGE,
} from "@/src/lib/customerDashboard";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

type Tab = "summary" | "favorites" | "reservations";

export function CustomerOverview() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("summary");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      setSummary(await fetchCustomerDashboardSummary());
    } catch (e) {
      if (isApiNotFound(e)) {
        console.warn("Customer dashboard summary unavailable (404).");
      } else {
        logApiError("Customer dashboard summary", e);
        toast.error("Özet verisi yüklenemedi.");
      }
      setSummary(CUSTOMER_DEFAULT_ZERO_SUMMARY);
    } finally {
      setLoadingSummary(false);
    }
  }, [toast]);

  const loadFavorites = useCallback(async () => {
    setLoadingFavorites(true);
    try {
      setFavorites(await fetchFavorites());
    } catch (e) {
      logApiError("Customer favorites", e);
      setFavorites([]);
      if (!isApiNotFound(e)) {
        toast.error("Favoriler yüklenemedi.");
      }
    } finally {
      setLoadingFavorites(false);
    }
  }, [toast]);

  const loadReservations = useCallback(async () => {
    setLoadingReservations(true);
    try {
      setReservations(await fetchMyReservations());
    } catch (e) {
      logApiError("Customer reservations", e);
      setReservations([]);
      if (!isApiNotFound(e)) {
        toast.error("Rezervasyonlar yüklenemedi.");
      }
    } finally {
      setLoadingReservations(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (tab === "favorites") loadFavorites();
    if (tab === "reservations") loadReservations();
  }, [tab, loadFavorites, loadReservations]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Özet" },
    { id: "favorites", label: "Favoriler" },
    { id: "reservations", label: "Rezervasyonlar" },
  ];

  const tabLoading =
    tab === "summary"
      ? loadingSummary
      : tab === "favorites"
        ? loadingFavorites
        : tab === "reservations"
          ? loadingReservations
          : false;

  return (
    <div className={`${glassCard} mb-8`}>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={
              tab === t.id
                ? "rounded-full bg-violet-500/25 px-4 py-1.5 text-xs font-semibold text-white"
                : `${btnSecondary} px-4 py-1.5 text-xs`
            }
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" ? (
        loadingSummary ? (
          <div className={`${skeletonClass} h-24`} />
        ) : (
          <SummaryCards
            summary={summary ?? CUSTOMER_DEFAULT_ZERO_SUMMARY}
            loading={false}
            className="mb-0"
            emptyMessage={CUSTOMER_EMPTY_DATA_MESSAGE}
          />
        )
      ) : tabLoading ? (
        <div className={`${skeletonClass} h-24`} />
      ) : tab === "favorites" ? (
        favorites.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {CUSTOMER_EMPTY_DATA_MESSAGE}{" "}
            <Link href="/marketplace" className="text-violet-300 hover:text-violet-200">
              Marketplace
            </Link>
            &apos;ten keşfedebilirsiniz.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {favorites.map((f) => (
              <li
                key={String(f.id ?? f.vendorServiceId)}
                className="rounded-lg border border-white/10 px-3 py-2"
              >
                <p className="font-medium text-white">
                  {f.serviceTitle ?? "Hizmet"}
                </p>
                <p className="text-zinc-400">
                  {f.vendorName} · {[f.city, f.district].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : reservations.length === 0 ? (
        <p className="text-sm text-zinc-500">{CUSTOMER_EMPTY_DATA_MESSAGE}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {reservations.map((r) => (
            <li
              key={String(r.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <div>
                <p className="font-medium text-white">{r.serviceTitle ?? "—"}</p>
                <p className="text-zinc-400">{r.eventDate}</p>
                {r.status ? (
                  <div className="mt-1.5">
                    <StatusBadge status={r.status} context="customer" />
                  </div>
                ) : null}
              </div>
              {r.id != null && r.status !== "Cancelled" ? (
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  onClick={async () => {
                    try {
                      await cancelReservation(r.id!);
                      toast.success("Rezervasyon iptal edildi.");
                      loadReservations();
                    } catch (err) {
                      logApiError("Cancel reservation", err);
                      if (!isApiNotFound(err)) {
                        toast.error("İptal edilemedi.");
                      }
                    }
                  }}
                >
                  İptal
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
