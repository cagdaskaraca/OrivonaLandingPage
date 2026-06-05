import type { OfferRequest } from "@/src/lib/api/types";
import {
  offerPriceHasDiscount,
  resolveOfferDisplayPrice,
  resolveOfferPricing,
  type OfferPricingFields,
} from "@/src/lib/offerPricing";
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

export function offerPricingInput(offer: OfferRequest): OfferPricingFields {
  const nested = offer.vendorOffer;
  const hasDiscountData =
    offer.hasDiscount === true ||
    nested?.hasDiscount === true ||
    offer.finalPrice != null ||
    nested?.finalPrice != null ||
    offer.agreedPrice != null ||
    nested?.agreedPrice != null ||
    offer.displayPrice != null ||
    Boolean(offer.couponCode ?? nested?.couponCode);
  return {
    originalPrice: offer.originalPrice ?? nested?.originalPrice,
    finalPrice:
      offer.finalPrice ??
      offer.discountedPrice ??
      offer.agreedPrice ??
      nested?.finalPrice ??
      nested?.agreedPrice,
    agreedPrice: offer.agreedPrice ?? nested?.agreedPrice,
    displayPrice: offer.displayPrice,
    hasDiscount: offer.hasDiscount ?? nested?.hasDiscount,
    discountAmount: offer.discountAmount ?? nested?.discountAmount,
    discountPercent: offer.discountPercent ?? nested?.discountPercent,
    couponCode:
      offer.couponCode ??
      offer.appliedCouponCode ??
      nested?.couponCode,
    price: hasDiscountData
      ? undefined
      : (offer.price ?? nested?.price ?? offerResponsePrice(offer)),
  };
}

export function offerOriginalPrice(offer: OfferRequest): number | undefined {
  return resolveOfferPricing(offerPricingInput(offer)).originalPrice;
}

export function offerFinalPrice(offer: OfferRequest): number | undefined {
  return resolveOfferPricing(offerPricingInput(offer)).finalPrice;
}

export function offerHasDiscount(offer: OfferRequest): boolean {
  return offerPriceHasDiscount(offerPricingInput(offer));
}

export function isAcceptedOfferStatus(status?: string | null): boolean {
  const s = normalizeOfferStatusKey(status);
  return (
    s === "acceptedbycustomer" ||
    s === "customeraccepted" ||
    s === "accepted"
  );
}

export function isCancelledOfferStatus(status?: string | null): boolean {
  const s = normalizeOfferStatusKey(status);
  return (
    s === "cancelled" ||
    s === "canceled" ||
    s === "cancelledbycustomer"
  );
}

export function getCustomerCancelTarget(
  offer: OfferRequest,
):
  | { kind: "offer"; id: string | number }
  | { kind: "request"; id: string | number }
  | null {
  if (isCancelledOfferStatus(offer.status)) return null;
  if (isAcceptedOfferStatus(offer.status) || isOfferSentToCustomer(offer.status)) {
    const offerId = getCustomerOfferActionId(offer);
    if (offerId != null) return { kind: "offer", id: offerId };
  }
  if (isPendingVendorResponse(offer.status) && offer.id != null) {
    return { kind: "request", id: offer.id };
  }
  return null;
}

export function canCustomerCancelOffer(offer: OfferRequest): boolean {
  return getCustomerCancelTarget(offer) != null;
}

function offerListRecency(offer: OfferRequest): number {
  const date = offer.createdAt?.trim();
  if (date) {
    const ts = Date.parse(date);
    if (!Number.isNaN(ts)) return ts;
  }
  const id = offer.id;
  if (typeof id === "number") return id;
  if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
  return 0;
}

function offerCategoryVendorKey(offer: OfferRequest): string | null {
  if (offer.eventPlanId == null) return null;
  const category = (offer.category ?? "genel").trim().toLocaleLowerCase("tr-TR");
  const vendor = (offer.vendorName ?? offer.serviceTitle ?? "isletme")
    .trim()
    .toLocaleLowerCase("tr-TR");
  return `${offer.eventPlanId}::${category}::${vendor}`;
}

/** Aynı etkinlik+kategori+işletme için yalnızca en güncel kabul edilmiş teklifi gösterir. */
export function dedupeCustomerOfferList(offers: OfferRequest[]): OfferRequest[] {
  const acceptedLatest = new Map<string, OfferRequest>();

  for (const offer of offers) {
    if (!isAcceptedOfferStatus(offer.status)) continue;
    const key = offerCategoryVendorKey(offer);
    if (!key) continue;
    const existing = acceptedLatest.get(key);
    if (!existing || offerListRecency(offer) >= offerListRecency(existing)) {
      acceptedLatest.set(key, offer);
    }
  }

  const latestAcceptedIds = new Set(
    [...acceptedLatest.values()].map((offer) => String(offer.id)),
  );

  return offers
    .filter((offer) => {
      if (!isAcceptedOfferStatus(offer.status)) return true;
      const key = offerCategoryVendorKey(offer);
      if (!key) return true;
      return latestAcceptedIds.has(String(offer.id));
    })
    .sort((a, b) => offerListRecency(b) - offerListRecency(a));
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
