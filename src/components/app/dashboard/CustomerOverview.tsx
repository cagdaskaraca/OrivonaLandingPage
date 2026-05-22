"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cancelReservation,
  fetchCustomerDashboardSummary,
  fetchFavorites,
  fetchMyOfferRequests,
  fetchMyReservations,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  DashboardSummary,
  FavoriteItem,
  OfferRequest,
  Reservation,
} from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

type Tab = "summary" | "favorites" | "offers" | "reservations";

export function CustomerOverview() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("summary");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [offers, setOffers] = useState<OfferRequest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadTab(next: Tab) {
    setLoading(true);
    try {
      if (next === "summary") setSummary(await fetchCustomerDashboardSummary());
      if (next === "favorites") setFavorites(await fetchFavorites());
      if (next === "offers") setOffers(await fetchMyOfferRequests());
      if (next === "reservations") setReservations(await fetchMyReservations());
    } catch (e) {
      if (e instanceof ApiError) console.log("Customer overview failed", e.body);
      toast.error(formatApiErrorMessage(e, "Veri yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Özet" },
    { id: "favorites", label: "Favoriler" },
    { id: "offers", label: "Teklifler" },
    { id: "reservations", label: "Rezervasyonlar" },
  ];

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
      {loading ? (
        <div className={`${skeletonClass} h-24`} />
      ) : tab === "summary" ? (
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(summary ?? {}).map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <dt className="text-xs text-zinc-500">{k}</dt>
              <dd className="mt-1 text-lg font-semibold text-white">{v}</dd>
            </div>
          ))}
          {Object.keys(summary ?? {}).length === 0 ? (
            <p className="text-sm text-zinc-500">Özet verisi yok.</p>
          ) : null}
        </dl>
      ) : tab === "favorites" ? (
        favorites.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Favori yok.{" "}
            <Link href="/marketplace" className="text-violet-300">
              Marketplace
            </Link>
            &apos;ten ekleyin.
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
      ) : tab === "offers" ? (
        offers.length === 0 ? (
          <p className="text-sm text-zinc-500">Teklif isteği yok.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {offers.map((o) => (
              <li
                key={String(o.id)}
                className="rounded-lg border border-white/10 px-3 py-2"
              >
                <p className="font-medium text-white">{o.serviceTitle ?? "—"}</p>
                <p className="text-zinc-400">{o.status ?? "Bekliyor"}</p>
                {o.offeredPrice != null ? (
                  <p className="text-violet-200">
                    Teklif: {o.offeredPrice.toLocaleString("tr-TR")} ₺
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )
      ) : reservations.length === 0 ? (
        <p className="text-sm text-zinc-500">Rezervasyon yok.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {reservations.map((r) => (
            <li
              key={String(r.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <div>
                <p className="font-medium text-white">{r.serviceTitle ?? "—"}</p>
                <p className="text-zinc-400">
                  {r.eventDate} · {r.status}
                </p>
              </div>
              {r.id != null && r.status !== "Cancelled" ? (
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  onClick={async () => {
                    try {
                      await cancelReservation(r.id!);
                      toast.success("Rezervasyon iptal edildi.");
                      loadTab("reservations");
                    } catch (err) {
                      toast.error(
                        formatApiErrorMessage(err, "İptal edilemedi."),
                      );
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
