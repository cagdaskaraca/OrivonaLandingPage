import type { Reservation } from "@/src/lib/api/types";
import {
  resolveOfferDisplayPrice,
  resolveOfferPricing,
  type OfferPricingFields,
} from "@/src/lib/offerPricing";
import { normalizeStatusKey } from "@/src/lib/statusLabels";

export function normalizeReservationStatusKey(
  status?: string | null,
): string {
  return normalizeStatusKey(status);
}

export function reservationActionId(
  reservation: Reservation,
): string | number | undefined {
  return reservation.id;
}

export function reservationPricingInput(
  reservation: Reservation,
): OfferPricingFields {
  return {
    originalPrice: reservation.originalPrice ?? reservation.totalPrice,
    finalPrice:
      reservation.finalPrice ??
      reservation.agreedPrice ??
      reservation.totalPrice,
    agreedPrice: reservation.agreedPrice ?? reservation.finalPrice,
    hasDiscount: reservation.hasDiscount,
    discountAmount: reservation.discountAmount,
    discountPercent: reservation.discountPercent,
    couponCode: reservation.couponCode,
    price: reservation.totalPrice,
  };
}

export function reservationDisplayPrice(
  reservation: Reservation,
): number {
  return resolveOfferDisplayPrice(reservationPricingInput(reservation));
}

export function isCancelledReservationStatus(
  status?: string | null,
): boolean {
  const s = normalizeReservationStatusKey(status);
  return (
    s === "cancelled" ||
    s === "canceled" ||
    s === "cancelledbycustomer" ||
    s === "cancelledbyvendor" ||
    s === "rejected" ||
    s === "rejectedbyvendor"
  );
}

export function isCompletedReservationStatus(
  status?: string | null,
): boolean {
  const s = normalizeReservationStatusKey(status);
  return s === "completed" || s === "paid";
}

export function isPendingVendorApprovalStatus(
  status?: string | null,
): boolean {
  const s = normalizeReservationStatusKey(status);
  return (
    !s ||
    s === "pending" ||
    s === "beklemede" ||
    s === "awaitingapproval" ||
    s === "awaitingconfirmation" ||
    s === "awaitingvendorconfirmation" ||
    s === "awaitingvendorapproval" ||
    s === "created" ||
    s === "new"
  );
}

export function isConfirmedReservationStatus(
  status?: string | null,
): boolean {
  const s = normalizeReservationStatusKey(status);
  return (
    s === "confirmed" ||
    s === "active" ||
    s === "awaitingpayment" ||
    s === "paymentpending"
  );
}

/** İşletme onayı bekleyen (Beklemede dahil bilinmeyen durumlar). */
export function canVendorConfirmReservation(
  status?: string | null,
): boolean {
  if (
    isCancelledReservationStatus(status) ||
    isCompletedReservationStatus(status) ||
    isConfirmedReservationStatus(status)
  ) {
    return false;
  }
  return true;
}

export function canVendorRejectReservation(
  status?: string | null,
): boolean {
  return canVendorConfirmReservation(status);
}

/** İşletme «Tamamla» — ödeme sonrası etkinlik gerçekleşti. */
export function canVendorCompleteReservation(
  status?: string | null,
): boolean {
  if (isCancelledReservationStatus(status) || isCompletedReservationStatus(status)) {
    return false;
  }
  const s = normalizeReservationStatusKey(status);
  return s === "confirmed" || s === "active" || s === "paid";
}

/** Müşteri — işletme onayından sonra ödeme ekranı. */
export function canCustomerPayReservation(
  status?: string | null,
): boolean {
  if (isCancelledReservationStatus(status) || isCompletedReservationStatus(status)) {
    return false;
  }
  return isConfirmedReservationStatus(status);
}

export function canCustomerCancelReservation(
  status?: string | null,
): boolean {
  if (isCancelledReservationStatus(status) || isCompletedReservationStatus(status)) {
    return false;
  }
  const s = normalizeReservationStatusKey(status);
  if (s === "paid") return false;
  return true;
}

export function customerReservationActionHint(
  status?: string | null,
): string | null {
  if (isCancelledReservationStatus(status)) {
    return "Bu rezervasyon iptal edildi.";
  }
  if (isCompletedReservationStatus(status)) {
    return "Rezervasyon tamamlandı.";
  }
  if (canCustomerPayReservation(status)) {
    return "İşletme onayladı. Anlaştığınız tutarı «Ödeme Yap» ile ödeyebilirsiniz.";
  }
  if (canVendorConfirmReservation(status)) {
    return "İşletme onayı bekleniyor.";
  }
  return null;
}

export function vendorReservationActionHint(
  status?: string | null,
): string | null {
  if (isCancelledReservationStatus(status)) {
    return "Müşteri veya işletme tarafından iptal/red edildi.";
  }
  if (isCompletedReservationStatus(status)) {
    return "Bu rezervasyon tamamlandı.";
  }
  if (canVendorConfirmReservation(status)) {
    return "Müşteri teklifi kabul etti. «Onayla» veya uygun değilse «Reddet».";
  }
  if (canVendorCompleteReservation(status)) {
    return "Müşteri ödemesi sonrası etkinlik gerçekleşince «Tamamla» ile kapatın.";
  }
  return null;
}

export function reservationPricingSummary(
  reservation: Reservation,
): ReturnType<typeof resolveOfferPricing> {
  return resolveOfferPricing(reservationPricingInput(reservation));
}
