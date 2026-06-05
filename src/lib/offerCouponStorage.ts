const KEY_PREFIX = "orivona_offer_coupon_";

function storageKey(requestId: string | number): string {
  return `${KEY_PREFIX}${String(requestId)}`;
}

/** Teklif talebi oluşturulduktan sonra kuponu kabul adımı için saklar. */
export function saveOfferRequestCoupon(
  requestId: string | number,
  couponCode: string,
): void {
  if (typeof window === "undefined") return;
  const code = couponCode.trim().toUpperCase();
  if (!code) return;
  try {
    sessionStorage.setItem(storageKey(requestId), code);
  } catch {
    /* ignore quota */
  }
}

export function getOfferRequestCoupon(
  requestId: string | number | undefined,
): string | undefined {
  if (requestId == null || typeof window === "undefined") return undefined;
  try {
    const code = sessionStorage.getItem(storageKey(requestId));
    return code?.trim().toUpperCase() || undefined;
  } catch {
    return undefined;
  }
}

export function clearOfferRequestCoupon(requestId: string | number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey(requestId));
  } catch {
    /* ignore */
  }
}
