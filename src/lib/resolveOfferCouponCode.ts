import type { OfferRequest } from "@/src/lib/api/types";
import { getOfferRequestCoupon } from "@/src/lib/offerCouponStorage";

/** API yanıtı, session veya kullanıcı girişinden kabul/apply için kupon kodu. */
export function resolveOfferCouponCode(
  offer: OfferRequest,
  fallback?: string | null,
): string | undefined {
  const fromApi = offer.couponCode?.trim().toUpperCase();
  if (fromApi) return fromApi;
  const fromSession = getOfferRequestCoupon(offer.id ?? offer.eventRequestId);
  if (fromSession) return fromSession;
  const fromFallback = fallback?.trim().toUpperCase();
  return fromFallback || undefined;
}
