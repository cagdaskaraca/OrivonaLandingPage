"use client";

import { OfferPriceBreakdown } from "@/src/components/offers/OfferPriceBreakdown";
import { Modal } from "@/src/components/ui/Modal";
import type { Reservation } from "@/src/lib/api/types";
import { formatOfferDate } from "@/src/lib/offerRequest";
import {
  reservationPricingInput,
  reservationPricingSummary,
} from "@/src/lib/reservationUi";
import { btnPrimary, btnSecondary } from "@/src/lib/ui";

type ReservationPaymentModalProps = {
  reservation: Reservation | null;
  open: boolean;
  onClose: () => void;
  onPayAttempt: () => void;
};

export function ReservationPaymentModal({
  reservation,
  open,
  onClose,
  onPayAttempt,
}: ReservationPaymentModalProps) {
  if (!reservation) return null;

  const pricing = reservationPricingSummary(reservation);
  const dateLabel = formatOfferDate(reservation.eventDate) || reservation.eventDate;

  return (
    <Modal
      open={open}
      title="Rezervasyon ödemesi"
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Kapat
          </button>
          <button type="button" className={btnPrimary} onClick={onPayAttempt}>
            Ödeme Yap
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-white">
            {reservation.serviceTitle ?? "Hizmet"}
          </p>
          <p className="mt-1 text-zinc-400">
            {reservation.vendorName ?? "İşletme"}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            Anlaşılan tutar
          </p>
          <div className="mt-2">
            <OfferPriceBreakdown
              pricing={reservationPricingInput(reservation)}
              size="md"
            />
          </div>
          {!pricing.finalPrice && !pricing.originalPrice ? (
            <p className="mt-2 text-xs text-zinc-500">
              Tutar API yanıtında yok; teklif kabulündeki anlaşma fiyatı
              kullanılacak.
            </p>
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">
          İşletme rezervasyonu onayladıktan sonra bu ekrandan ödeme
          yapabilirsiniz. Ödeme tamamlandığında rezervasyon kesinleşir.
        </p>
      </div>
    </Modal>
  );
}
