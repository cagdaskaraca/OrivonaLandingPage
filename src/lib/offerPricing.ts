/** API offer / agreement / budget satırlarında indirimli tutar önceliği. */
export type OfferPriceFields = {
  finalPrice?: number | null;
  agreedPrice?: number | null;
  displayPrice?: number | null;
  price?: number | null;
  originalPrice?: number | null;
  amount?: number | null;
};

function toNum(value?: number | null): number | undefined {
  if (value == null || Number.isNaN(value)) return undefined;
  return value;
}

/** Checklist ve bütçede gösterilecek nihai (indirimli) tutar. */
export function resolveOfferDisplayPrice(item: OfferPriceFields): number {
  return (
    toNum(item.finalPrice) ??
    toNum(item.agreedPrice) ??
    toNum(item.displayPrice) ??
    toNum(item.price) ??
    toNum(item.amount) ??
    0
  );
}

/** Üstü çizili liste fiyatı — indirim varsa originalPrice, yoksa display fiyat. */
export function resolveOfferOriginalPrice(item: OfferPriceFields): number | undefined {
  const original = toNum(item.originalPrice);
  const display = resolveOfferDisplayPrice(item);
  if (original != null && display > 0 && original > display) return original;
  return original ?? (display > 0 ? display : undefined);
}

export function offerPriceHasDiscount(item: OfferPriceFields): boolean {
  const original = resolveOfferOriginalPrice(item);
  const final = resolveOfferDisplayPrice(item);
  return original != null && final > 0 && final < original;
}
