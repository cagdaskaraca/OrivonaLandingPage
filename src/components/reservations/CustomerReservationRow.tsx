"use client";

import { useState } from "react";
import { cancelReservation } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { Reservation } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { OfferPriceBreakdown } from "@/src/components/offers/OfferPriceBreakdown";
import { ReservationPaymentModal } from "@/src/components/reservations/ReservationPaymentModal";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { formatOfferDate } from "@/src/lib/offerRequest";
import {
  canCustomerCancelReservation,
  canCustomerPayReservation,
  customerReservationActionHint,
  reservationActionId,
  reservationPricingInput,
} from "@/src/lib/reservationUi";
import { btnPrimary, btnSecondary } from "@/src/lib/ui";

type CustomerReservationRowProps = {
  reservation: Reservation;
  onRefresh: () => void;
};

export function CustomerReservationRow({
  reservation: r,
  onRefresh,
}: CustomerReservationRowProps) {
  const toast = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const actionId = reservationActionId(r);
  const showPay = canCustomerPayReservation(r.status);
  const showCancel = canCustomerCancelReservation(r.status);
  const hint = customerReservationActionHint(r.status);
  const dateLabel = formatOfferDate(r.eventDate) || r.eventDate;

  return (
    <>
      <div className="rounded-lg border border-white/10 px-3 py-2 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{r.serviceTitle ?? "—"}</p>
            <p className="text-zinc-400">
              {r.vendorName ?? "İşletme"}
              {dateLabel ? ` · ${dateLabel}` : ""}
            </p>
            {r.status ? (
              <div className="mt-1.5">
                <StatusBadge status={r.status} context="customer" />
              </div>
            ) : null}
            <div className="mt-2">
              <OfferPriceBreakdown
                pricing={reservationPricingInput(r)}
                size="sm"
              />
            </div>
          </div>
          {actionId != null && (showPay || showCancel) ? (
            <div className="flex flex-wrap gap-2">
              {showPay ? (
                <button
                  type="button"
                  className={`${btnPrimary} text-xs`}
                  onClick={() => setPaymentOpen(true)}
                >
                  Ödeme Yap
                </button>
              ) : null}
              {showCancel ? (
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  onClick={async () => {
                    if (
                      !window.confirm(
                        "Bu rezervasyonu iptal etmek istediğinize emin misiniz?",
                      )
                    ) {
                      return;
                    }
                    try {
                      await cancelReservation(actionId);
                      toast.success("Rezervasyon iptal edildi.");
                      onRefresh();
                    } catch (err) {
                      logApiError("Cancel reservation", err);
                      if (!isApiNotFound(err)) toast.error("İptal edilemedi.");
                    }
                  }}
                >
                  İptal
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-2 text-xs text-zinc-500">{hint}</p>
        ) : null}
      </div>

      <ReservationPaymentModal
        reservation={r}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onPayAttempt={() => {
          toast.toast("Ödeme akışı henüz eklenmedi.", "info");
        }}
      />
    </>
  );
}
