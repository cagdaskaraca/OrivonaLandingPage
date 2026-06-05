"use client";

import { useCallback, useState } from "react";
import { OfferCouponActions } from "@/src/components/offers/OfferCouponActions";
import { OfferRequestCard } from "@/src/components/offers/OfferRequestCard";
import type { OfferRequest } from "@/src/lib/api/types";
import {
  canCustomerCancelOffer,
  canCustomerRespondToOffer,
  getCustomerOfferActionId,
  isAcceptedOfferStatus,
  isCancelledOfferStatus,
  offerHasDiscount,
} from "@/src/lib/offerRequest";
import { resolveOfferCouponCode } from "@/src/lib/resolveOfferCouponCode";
import { btnPrimary } from "@/src/lib/ui";

const btnDangerClass =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none";

type CustomerOfferListItemProps = {
  offer: OfferRequest;
  busy: boolean;
  showDemoConfirm: boolean;
  onAccept: (offer: OfferRequest, couponCode?: string) => void;
  onReject: (offer: OfferRequest) => void;
  onCancel: (offer: OfferRequest) => void;
  onApplyCoupon: (offer: OfferRequest, couponCode: string) => Promise<void>;
  as?: "li" | "div";
};

export function CustomerOfferListItem({
  offer,
  busy,
  showDemoConfirm,
  onAccept,
  onReject,
  onCancel,
  onApplyCoupon,
  as: Tag = "li",
}: CustomerOfferListItemProps) {
  const actionId = getCustomerOfferActionId(offer);
  const showActions = canCustomerRespondToOffer(offer);
  const showCancel = canCustomerCancelOffer(offer);
  const cancelled = isCancelledOfferStatus(offer.status);
  const accepted = isAcceptedOfferStatus(offer.status);
  const showRetroCoupon = accepted && !offerHasDiscount(offer) && actionId != null;

  const [acceptCoupon, setAcceptCoupon] = useState<string | undefined>(() =>
    resolveOfferCouponCode(offer),
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleCouponReady = useCallback((code: string | undefined) => {
    setAcceptCoupon(code);
  }, []);

  return (
    <Tag className="flex h-full min-h-0 flex-col">
      <OfferRequestCard offer={offer} variant="customer" as="div" className="flex-1" />
      {cancelled ? (
        <p className="mt-2 text-xs text-zinc-500">
          Bu teklif iptal edildi; checklist ve bütçeye dahil değildir.
        </p>
      ) : null}
      {showDemoConfirm ? (
        <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p className="font-medium">Demo rezervasyon onayı</p>
          <p className="mt-1 text-emerald-200/90">
            Teklif kabul edildi. Rezervasyon kaydınız oluşturuldu. Ödeme altyapısı
            yakında aktif edilecektir.
          </p>
        </div>
      ) : null}
      {showActions && actionId != null ? (
        <div className="mt-3 space-y-3">
          <OfferCouponActions
            offer={offer}
            mode="accept"
            onCouponReady={handleCouponReady}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${btnPrimary} !px-4 !py-2 text-xs`}
              disabled={busy}
              onClick={() => onAccept(offer, acceptCoupon)}
            >
              {busy ? "İşleniyor…" : "Teklifi Kabul Et"}
            </button>
            <button
              type="button"
              className={btnDangerClass}
              disabled={busy}
              onClick={() => onReject(offer)}
            >
              Teklifi Reddet
            </button>
          </div>
        </div>
      ) : null}
      {showRetroCoupon ? (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3">
          <p className="mb-2 text-xs text-amber-100/90">
            Bu teklifte kupon indirimi uygulanmamış. Geriye dönük kupon
            ekleyebilirsiniz.
          </p>
          <OfferCouponActions
            offer={offer}
            mode="apply-retro"
            onCouponReady={handleCouponReady}
            applying={applyingCoupon}
            onApplyRetro={async (code) => {
              setApplyingCoupon(true);
              try {
                await onApplyCoupon(offer, code);
              } finally {
                setApplyingCoupon(false);
              }
            }}
          />
        </div>
      ) : null}
      {showCancel && !showActions ? (
        <div className="mt-3">
          <button
            type="button"
            className={btnDangerClass}
            disabled={busy}
            onClick={() => onCancel(offer)}
          >
            {busy
              ? "İptal ediliyor…"
              : accepted
                ? "Kabulü İptal Et"
                : "Talebi İptal Et"}
          </button>
        </div>
      ) : null}
    </Tag>
  );
}
