/** API offer / agreement / budget satırlarında fiyat alanları. */
export type OfferPriceFields = {
  finalPrice?: number | null;
  agreedPrice?: number | null;
  displayPrice?: number | null;
  price?: number | null;
  originalPrice?: number | null;
  amount?: number | null;
};

export type OfferPricingFields = OfferPriceFields & {
  hasDiscount?: boolean | null;
  discountAmount?: number | null;
  discountPercent?: number | null;
  couponCode?: string | null;
};

export type ResolvedOfferPricing = {
  hasDiscount: boolean;
  originalPrice?: number;
  finalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  couponCode?: string;
};

function toNum(value?: number | null): number | undefined {
  if (value == null || Number.isNaN(value)) return undefined;
  return value;
}

function hasDiscountFields(item: OfferPricingFields): boolean {
  return (
    item.hasDiscount === true ||
    toNum(item.finalPrice) != null ||
    toNum(item.displayPrice) != null
  );
}

/**
 * İndirimli tutar — price/vendorOffer.price YALNIZCA indirim alanı yoksa kullanılır.
 * price genelde indirim ÖNCESİ işletme fiyatıdır.
 */
export function resolveOfferDisplayPrice(item: OfferPricingFields): number {
  const discounted =
    toNum(item.finalPrice) ??
    toNum(item.displayPrice) ??
    toNum(item.agreedPrice);
  if (discounted != null) return discounted;
  if (hasDiscountFields(item) || item.hasDiscount === true) return 0;
  return toNum(item.price) ?? toNum(item.amount) ?? 0;
}

export function resolveOfferOriginalPrice(
  item: OfferPricingFields,
): number | undefined {
  const original = toNum(item.originalPrice);
  const display = resolveOfferDisplayPrice(item);
  if (original != null && display > 0 && original > display) return original;
  if (item.hasDiscount === true && original != null) return original;
  if (!item.hasDiscount && display > 0) return display;
  return original;
}

export function offerPriceHasDiscount(item: OfferPricingFields): boolean {
  return resolveOfferPricing(item).hasDiscount;
}

/** Teklif / anlaşma / bütçe satırı için tüm fiyat gösterim verisi. */
export function resolveOfferPricing(item: OfferPricingFields): ResolvedOfferPricing {
  const finalPrice = resolveOfferDisplayPrice(item);
  const final = finalPrice > 0 ? finalPrice : undefined;
  const originalRaw = toNum(item.originalPrice);
  let hasDiscount = item.hasDiscount === true;

  if (
    !hasDiscount &&
    originalRaw != null &&
    final != null &&
    originalRaw > final
  ) {
    hasDiscount = true;
  }

  if (!hasDiscount) {
    return {
      hasDiscount: false,
      originalPrice: final,
      finalPrice: final,
    };
  }

  const originalPrice = originalRaw ?? final;
  let discountAmount = toNum(item.discountAmount);
  if (
    discountAmount == null &&
    originalPrice != null &&
    final != null &&
    originalPrice > final
  ) {
    discountAmount = originalPrice - final;
  }

  let discountPercent = toNum(item.discountPercent);
  if (
    discountPercent == null &&
    originalPrice != null &&
    originalPrice > 0 &&
    discountAmount != null
  ) {
    discountPercent = Math.round((discountAmount / originalPrice) * 100);
  }

  const couponCode = item.couponCode?.trim() || undefined;

  return {
    hasDiscount: true,
    originalPrice,
    finalPrice: final,
    discountAmount,
    discountPercent,
    couponCode,
  };
}

export function formatOfferMoney(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} ₺`;
}

export function formatDiscountLine(pricing: ResolvedOfferPricing): string | null {
  if (!pricing.hasDiscount) return null;
  const detail: string[] = [];
  if (pricing.discountPercent != null && pricing.discountPercent > 0) {
    detail.push(`%${pricing.discountPercent}`);
  }
  if (pricing.discountAmount != null && pricing.discountAmount > 0) {
    detail.push(`(${formatOfferMoney(pricing.discountAmount)})`);
  }
  const core =
    detail.length > 0
      ? `Kupon indirimi ${detail.join(" ")}`
      : "Kupon indirimi";
  return pricing.couponCode ? `${core} · ${pricing.couponCode}` : core;
}
