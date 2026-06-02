import type { OfferRequest } from "@/src/lib/api/types";
import {
  getStatusBadgeClassName,
  getStatusLabel,
  normalizeStatusKey,
} from "@/src/lib/statusLabels";

const FINAL_STATUSES = new Set([
  "rejectedbyvendor",
  "acceptedbycustomer",
  "rejectedbycustomer",
  "expired",
  "cancelled",
  "canceled",
  "accepted",
  "rejected",
  "customeraccepted",
]);

export function normalizeOfferStatusKey(status?: string | null): string {
  const n = normalizeStatusKey(status);
  return n || "pendingvendorresponse";
}

/** @deprecated Prefer getStatusLabel from @/src/lib/statusLabels */
export function formatOfferStatus(status?: string | null): string {
  return getStatusLabel(status, "customer");
}

/** @deprecated Prefer getStatusBadgeClassName from @/src/lib/statusLabels */
export function getOfferStatusStyle(status?: string | null): string {
  return getStatusBadgeClassName(status);
}

export function isFinalOfferStatus(status?: string | null): boolean {
  return FINAL_STATUSES.has(normalizeOfferStatusKey(status));
}

export function isPendingVendorResponse(status?: string | null): boolean {
  const s = normalizeOfferStatusKey(status);
  return s === "pendingvendorresponse" || s === "pending";
}

export function isOfferSentToCustomer(status?: string | null): boolean {
  return normalizeOfferStatusKey(status) === "offersent";
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
