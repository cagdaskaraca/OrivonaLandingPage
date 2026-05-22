import type { OfferRequest } from "@/src/lib/api/types";

const STATUS_LABELS: Record<string, string> = {
  PendingVendorResponse: "İşletme yanıtı bekleniyor",
  RejectedByVendor: "İşletme reddetti",
  OfferSent: "Teklif gönderildi",
  AcceptedByCustomer: "Müşteri kabul etti",
  RejectedByCustomer: "Müşteri reddetti",
  Expired: "Süresi doldu",
  Cancelled: "İptal edildi",
  Pending: "İşletme yanıtı bekleniyor",
  Accepted: "Müşteri kabul etti",
  Rejected: "Reddedildi",
};

const STATUS_STYLES: Record<string, string> = {
  PendingVendorResponse: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  RejectedByVendor: "border-red-400/30 bg-red-500/15 text-red-200",
  OfferSent: "border-violet-400/30 bg-violet-500/15 text-violet-100",
  AcceptedByCustomer: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  RejectedByCustomer: "border-red-400/30 bg-red-500/15 text-red-200",
  Expired: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  Cancelled: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  Pending: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  Accepted: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  Rejected: "border-red-400/30 bg-red-500/15 text-red-200",
};

const FINAL_STATUSES = new Set([
  "rejectedbyvendor",
  "acceptedbycustomer",
  "rejectedbycustomer",
  "expired",
  "cancelled",
  "accepted",
  "rejected",
]);

export function normalizeOfferStatusKey(status?: string | null): string {
  if (!status?.trim()) return "pendingvendorresponse";
  return status.trim().replace(/\s+/g, "").toLowerCase();
}

export function formatOfferStatus(status?: string | null): string {
  if (!status?.trim()) return STATUS_LABELS.PendingVendorResponse;
  const key = status.trim();
  if (STATUS_LABELS[key]) return STATUS_LABELS[key];
  const pascal =
    key.charAt(0).toUpperCase() + key.slice(1);
  if (STATUS_LABELS[pascal]) return STATUS_LABELS[pascal];
  const normalized = normalizeOfferStatusKey(status);
  for (const [k, label] of Object.entries(STATUS_LABELS)) {
    if (normalizeOfferStatusKey(k) === normalized) return label;
  }
  return key;
}

export function getOfferStatusStyle(status?: string | null): string {
  const key = status?.trim() || "PendingVendorResponse";
  if (STATUS_STYLES[key]) return STATUS_STYLES[key];
  const pascal = key.charAt(0).toUpperCase() + key.slice(1);
  if (STATUS_STYLES[pascal]) return STATUS_STYLES[pascal];
  return STATUS_STYLES.PendingVendorResponse;
}

export function isFinalOfferStatus(status?: string | null): boolean {
  return FINAL_STATUSES.has(normalizeOfferStatusKey(status));
}

export function isPendingVendorResponse(status?: string | null): boolean {
  const s = normalizeOfferStatusKey(status).toLowerCase();
  return s === "pendingvendorresponse" || s === "pending";
}

export function isOfferSentToCustomer(status?: string | null): boolean {
  return normalizeOfferStatusKey(status).toLowerCase() === "offersent";
}

export function canVendorActOnRequest(status?: string | null): boolean {
  return isPendingVendorResponse(status) && !isFinalOfferStatus(status);
}

export function canCustomerActOnOffer(status?: string | null): boolean {
  return isOfferSentToCustomer(status) && !isFinalOfferStatus(status);
}

/** POST /api/offers/{offerId}/accept|reject — must not be the offer-request id. */
export function getCustomerOfferActionId(
  offer: OfferRequest,
): string | number | undefined {
  const vendorOfferId = offer.offerId;
  if (vendorOfferId == null) return undefined;
  if (offer.id != null && String(vendorOfferId) === String(offer.id)) {
    return undefined;
  }
  return vendorOfferId;
}

export function canCustomerRespondToOffer(offer: OfferRequest): boolean {
  return (
    isOfferSentToCustomer(offer.status) &&
    getCustomerOfferActionId(offer) != null
  );
}

/** @deprecated Use isPendingVendorResponse */
export function isOfferPending(status?: string | null): boolean {
  return isPendingVendorResponse(status);
}

export function formatOfferDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const slice = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) return value;
  try {
    return new Date(slice + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return slice;
  }
}

export function offerResponsePrice(offer: OfferRequest): number | undefined {
  return (
    offer.vendorOfferPrice ??
    offer.offeredPrice ??
    offer.price
  );
}

export function offerResponseDescription(
  offer: OfferRequest,
): string | undefined {
  return (
    offer.vendorOfferDescription ??
    offer.responseDescription ??
    offer.description
  );
}

export function hasVendorPricedOffer(offer: OfferRequest): boolean {
  return (
    offerResponsePrice(offer) != null ||
    Boolean(offerResponseDescription(offer)?.trim())
  );
}
