import type { Reservation } from "@/src/lib/api/types";
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

export function isCancelledReservationStatus(
  status?: string | null,
): boolean {
  const s = normalizeReservationStatusKey(status);
  return (
    s === "cancelled" ||
    s === "canceled" ||
    s === "cancelledbycustomer" ||
    s === "cancelledbyvendor"
  );
}

export function isCompletedReservationStatus(
  status?: string | null,
): boolean {
  return normalizeReservationStatusKey(status) === "completed";
}

/** İşletme «Onayla» — müşteri kabulünden sonra bekleyen rezervasyon. */
export function canVendorConfirmReservation(
  status?: string | null,
): boolean {
  if (isCancelledReservationStatus(status) || isCompletedReservationStatus(status)) {
    return false;
  }
  const s = normalizeReservationStatusKey(status);
  if (s === "confirmed") return false;
  return (
    !s ||
    s === "pending" ||
    s === "pendingvendorresponse" ||
    s === "awaitingconfirmation" ||
    s === "awaitingvendorconfirmation" ||
    s === "awaitingvendor" ||
    s === "submitted" ||
    s === "demopending" ||
    s === "demo"
  );
}

/** İşletme «Tamamla» — onaylı, etkinlik gerçekleşti. */
export function canVendorCompleteReservation(
  status?: string | null,
): boolean {
  if (isCancelledReservationStatus(status) || isCompletedReservationStatus(status)) {
    return false;
  }
  const s = normalizeReservationStatusKey(status);
  return s === "confirmed" || s === "active";
}

export function vendorReservationActionHint(
  status?: string | null,
): string | null {
  if (isCancelledReservationStatus(status)) {
    return "Müşteri veya sistem tarafından iptal edildi; onay veya tamamlama yapılamaz.";
  }
  if (isCompletedReservationStatus(status)) {
    return "Bu rezervasyon tamamlandı.";
  }
  if (canVendorConfirmReservation(status)) {
    return "Müşteri teklifi kabul ettiğinde rezervasyon oluşur; siz «Onayla» ile kesinleştirirsiniz.";
  }
  if (canVendorCompleteReservation(status)) {
    return "Etkinlik gerçekleştikten sonra «Tamamla» ile kapatın.";
  }
  return null;
}
