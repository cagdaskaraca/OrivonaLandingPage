"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";
import { CustomerOfferListItem } from "@/src/components/offers/CustomerOfferListItem";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useToast } from "@/src/contexts/ToastContext";
import {
  acceptCustomerOffer,
  applyCustomerOfferCoupon,
  fetchMyOfferRequests,
  rejectCustomerOffer,
} from "@/src/lib/api";
import { cancelCustomerOfferFlow } from "@/src/lib/cancelCustomerOffer";
import { ApiError, formatApiErrorMessage, logApiError } from "@/src/lib/api/client";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { clearOfferRequestCoupon } from "@/src/lib/offerCouponStorage";
import type { OfferRequest } from "@/src/lib/api/types";
import {
  canCustomerCancelOffer,
  dedupeCustomerOfferList,
  getCustomerOfferActionId,
} from "@/src/lib/offerRequest";
import { resolveOfferCouponCode } from "@/src/lib/resolveOfferCouponCode";
import { btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

type CustomerOfferRequestsPanelProps = {
  embedded?: boolean;
  onOfferChange?: () => void;
  /** @deprecated use onOfferChange */
  onAfterAccept?: () => void;
};

export function CustomerOfferRequestsPanel({
  embedded = false,
  onOfferChange,
  onAfterAccept,
}: CustomerOfferRequestsPanelProps) {
  const toast = useToast();
  const notifyOfferChange = onOfferChange ?? onAfterAccept;
  const [offers, setOffers] = useState<OfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionOfferId, setActionOfferId] = useState<string | number | null>(null);
  const [acceptConfirmationId, setAcceptConfirmationId] = useState<
    string | number | null
  >(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyOfferRequests();
      setOffers(dedupeCustomerOfferList(list));
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

  async function handleAccept(offer: OfferRequest, couponFromUi?: string) {
    const offerId = getCustomerOfferActionId(offer);
    if (offerId == null) {
      toast.error("Teklif kimliği bulunamadı.");
      return;
    }
    const couponCode = resolveOfferCouponCode(offer, couponFromUi);
    setActionOfferId(offerId);
    try {
      await acceptCustomerOffer(offerId, {
        paymentMode: "Agreement",
        eventPlanId: offer.eventPlanId ?? null,
        couponCode,
      });
      if (offer.id != null) clearOfferRequestCoupon(offer.id);
      toast.success(
        "Teklif kabul edildi. Anlaşma oluşturuldu; işletme onayı bekleniyor.",
      );
      setAcceptConfirmationId(offer.id ?? offerId);
      await load();
      notifyOfferChange?.();
    } catch (e) {
      if (e instanceof ApiError) console.log("Accept offer failed", e.body);
      toast.error(formatApiErrorMessage(e, "Teklif kabul edilemedi."));
    } finally {
      setActionOfferId(null);
    }
  }

  async function handleApplyCoupon(offer: OfferRequest, couponCode: string) {
    const offerId = getCustomerOfferActionId(offer);
    if (offerId == null) {
      toast.error("Teklif kimliği bulunamadı.");
      return;
    }
    setActionOfferId(offerId);
    try {
      await applyCustomerOfferCoupon(offerId, { couponCode });
      toast.success("Kupon teklife uygulandı.");
      await load();
      notifyOfferChange?.();
    } catch (e) {
      if (e instanceof ApiError) console.log("Apply coupon failed", e.body);
      toast.error(formatApiErrorMessage(e, "Kupon uygulanamadı."));
    } finally {
      setActionOfferId(null);
    }
  }

  async function handleCancel(offer: OfferRequest) {
    if (!canCustomerCancelOffer(offer)) {
      toast.error("Bu teklif iptal edilemez.");
      return;
    }
    const message = offer.status?.toLowerCase().includes("accept")
      ? "Kabul ettiğiniz bu teklifi iptal etmek istiyor musunuz? Checklist ve bütçeden kaldırılır."
      : "Bu teklif talebini iptal etmek istiyor musunuz?";
    if (!window.confirm(message)) return;

    const target = getCustomerOfferActionId(offer) ?? offer.id;
    setActionOfferId(target ?? null);
    try {
      await cancelCustomerOfferFlow(offer);
      toast.success("Teklif iptal edildi.");
      setAcceptConfirmationId(null);
      await load();
      notifyOfferChange?.();
    } catch (e) {
      if (e instanceof ApiError) console.log("Cancel offer failed", e.body);
      toast.error(formatApiErrorMessage(e, "Teklif iptal edilemedi."));
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
      setAcceptConfirmationId(null);
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
            İşletmelerden gelen teklifleri inceleyin; kupon uygulayın, kabul edin
            veya iptal edin.
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
          icon={EMPTY_STATE_PRESETS.offersCustomer.icon}
          title={EMPTY_STATE_PRESETS.offersCustomer.title}
          description={EMPTY_STATE_PRESETS.offersCustomer.description}
          actionLabel={EMPTY_STATE_PRESETS.offersCustomer.actionLabel}
          href={EMPTY_STATE_PRESETS.offersCustomer.href}
        />
      ) : null}

      {!loading && offers.length > 0 ? (
        <DashboardPaginatedList
          items={offers}
          listClassName="space-y-4"
          searchPlaceholder="Teklif ara (işletme, hizmet…)"
          filterItem={(o, query) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const hay = [
              o.vendorName,
              o.serviceTitle,
              o.category,
              o.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          }}
          getItemKey={(o) => {
            const actionId = getCustomerOfferActionId(o);
            return String(o.id ?? actionId);
          }}
          renderItem={(o) => {
            const actionId = getCustomerOfferActionId(o);
            const busy = actionId != null && actionOfferId === actionId;
            const showAcceptConfirmation =
              acceptConfirmationId != null &&
              (o.id === acceptConfirmationId ||
                actionId === acceptConfirmationId);

            return (
              <CustomerOfferListItem
                offer={o}
                busy={busy}
                showAcceptConfirmation={showAcceptConfirmation}
                onAccept={(offer, coupon) => void handleAccept(offer, coupon)}
                onReject={(offer) => void handleReject(offer)}
                onCancel={(offer) => void handleCancel(offer)}
                onApplyCoupon={handleApplyCoupon}
              />
            );
          }}
        />
      ) : null}
    </>
  );

  if (embedded) return <div>{content}</div>;

  return <div className={`${glassCard} mb-8`}>{content}</div>;
}
