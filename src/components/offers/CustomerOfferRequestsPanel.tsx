"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OfferRequestCard } from "@/src/components/offers/OfferRequestCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { fetchMyOfferRequests } from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { OfferRequest } from "@/src/lib/api/types";
import { btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

type CustomerOfferRequestsPanelProps = {
  /** When true, omit outer glass card (e.g. inside tabbed overview). */
  embedded?: boolean;
};

export function CustomerOfferRequestsPanel({
  embedded = false,
}: CustomerOfferRequestsPanelProps) {
  const [offers, setOffers] = useState<OfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await fetchMyOfferRequests());
    } catch (e) {
      if (e instanceof ApiError) console.log("My offer requests failed", e.body);
      setOffers([]);
      setError(formatApiErrorMessage(e, "Teklif talepleri yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const content = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Teklif Taleplerim</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Marketplace&apos;ten gönderdiğiniz teklif istekleri ve işletme yanıtları.
          </p>
        </div>
        <button
          type="button"
          className={`${btnSecondary} text-xs`}
          onClick={load}
          disabled={loading}
        >
          Yenile
        </button>
      </div>

      {loading ? <div className={`${skeletonClass} h-32`} /> : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading && !error && offers.length === 0 ? (
        <EmptyState
          title="Henüz teklif talebiniz yok"
          description="Beğendiğiniz hizmetlerde Teklif İste ile işletmelerden fiyat alın."
          actionLabel="Marketplace'e git"
          onAction={() => {
            window.location.href = "/marketplace";
          }}
        />
      ) : null}

      {!loading && !error && offers.length > 0 ? (
        <ul className="space-y-3">
          {offers.map((o) => (
            <OfferRequestCard key={String(o.id)} offer={o} variant="customer" />
          ))}
        </ul>
      ) : null}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <div className={`${glassCard} mb-8`}>{content}</div>;
}
