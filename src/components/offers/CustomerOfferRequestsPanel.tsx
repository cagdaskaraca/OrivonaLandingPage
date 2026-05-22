"use client";

import { useCallback, useEffect, useState } from "react";
import { OfferRequestCard } from "@/src/components/offers/OfferRequestCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useToast } from "@/src/contexts/ToastContext";
import {
  acceptCustomerOffer,
  fetchMyOfferRequests,
  rejectCustomerOffer,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage, logApiError } from "@/src/lib/api/client";
import { CUSTOMER_EMPTY_DATA_MESSAGE } from "@/src/lib/customerDashboard";
import type { OfferRequest } from "@/src/lib/api/types";
import {
  canCustomerActOnOffer,
  getCustomerOfferActionId,
  hasVendorPricedOffer,
} from "@/src/lib/offerRequest";
import { btnPrimary, btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none";

type CustomerOfferRequestsPanelProps = {
  embedded?: boolean;
  onAfterAccept?: () => void;
};

export function CustomerOfferRequestsPanel({
  embedded = false,
  onAfterAccept,
}: CustomerOfferRequestsPanelProps) {
  const toast = useToast();
  const [offers, setOffers] = useState<OfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionOfferId, setActionOfferId] = useState<string | number | null>(null);
  const [demoConfirmationId, setDemoConfirmationId] = useState<
    string | number | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await fetchMyOfferRequests());
    } catch (e) {
      logApiError("My offer requests", e);
      setOffers([]);
      setError(formatApiErrorMessage(e, "Teklifler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(offer: OfferRequest) {
    const offerId = getCustomerOfferActionId(offer);
    if (offerId == null) {
      toast.error("Teklif kimliği bulunamadı.");
      return;
    }
    setActionOfferId(offerId);
    try {
      await acceptCustomerOffer(offerId);
      toast.success("Teklif kabul edildi. Demo rezervasyon oluşturuldu.");
      setDemoConfirmationId(offer.id ?? offerId);
      await load();
      onAfterAccept?.();
    } catch (e) {
      if (e instanceof ApiError) console.log("Accept offer failed", e.body);
      toast.error(formatApiErrorMessage(e, "Teklif kabul edilemedi."));
    } finally {
      setActionOfferId(null);
    }
  }

  async function handleReject(offer: OfferRequest) {
    const offerId = getCustomerOfferActionId(offer);
    if (offerId == null) {
      toast.error("Teklif kimliği bulunamadı.");
      return;
    }
    setActionOfferId(offerId);
    try {
      await rejectCustomerOffer(offerId);
      toast.success("Teklif reddedildi.");
      setDemoConfirmationId(null);
      await load();
    } catch (e) {
      if (e instanceof ApiError) console.log("Reject offer failed", e.body);
      toast.error(formatApiErrorMessage(e, "Teklif reddedilemedi."));
    } finally {
      setActionOfferId(null);
    }
  }

  const content = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Tekliflerim</h2>
          <p className="mt-1 text-sm text-zinc-500">
            İşletmelerden gelen fiyatlı teklifleri inceleyin, kabul edin veya reddedin.
          </p>
        </div>
        <button
          type="button"
          className={`${btnSecondary} text-xs`}
          onClick={load}
          disabled={loading || actionOfferId != null}
        >
          Yenile
        </button>
      </div>

      {loading ? <div className={`${skeletonClass} h-32`} /> : null}

      {!loading && error ? (
        <div
          role="alert"
          className="mb-4 whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && offers.length === 0 ? (
        <EmptyState
          title={CUSTOMER_EMPTY_DATA_MESSAGE}
          description="Marketplace veya hizmet detayından Teklif İste ile talep oluşturun."
          actionLabel="Marketplace'e git"
          onAction={() => {
            window.location.href = "/marketplace";
          }}
        />
      ) : null}

      {!loading && offers.length > 0 ? (
        <ul className="space-y-4">
          {offers.map((o) => {
            const actionId = getCustomerOfferActionId(o);
            const busy = actionId != null && actionOfferId === actionId;
            const showActions =
              canCustomerActOnOffer(o.status) && hasVendorPricedOffer(o);
            const showDemoConfirm =
              demoConfirmationId != null &&
              (o.id === demoConfirmationId || actionId === demoConfirmationId);

            return (
              <li key={String(o.id ?? actionId)}>
                <OfferRequestCard offer={o} variant="customer" />
                {showDemoConfirm ? (
                  <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    <p className="font-medium">Demo rezervasyon onayı</p>
                    <p className="mt-1 text-emerald-200/90">
                      Teklif kabul edildi. Demo ödeme ile rezervasyon kaydınız
                      oluşturuldu.
                    </p>
                  </div>
                ) : null}
                {showActions && actionId != null ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${btnPrimary} !px-4 !py-2 text-xs`}
                      disabled={busy}
                      onClick={() => handleAccept(o)}
                    >
                      {busy ? "İşleniyor…" : "Teklifi Kabul Et"}
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      disabled={busy}
                      onClick={() => handleReject(o)}
                    >
                      Teklifi Reddet
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <div className={`${glassCard} mb-8`}>{content}</div>;
}
