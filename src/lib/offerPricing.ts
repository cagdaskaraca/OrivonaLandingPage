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

/** Teklif / anlaşma / bütçe satırı için tüm fiyat gösterim verisi. */
export function resolveOfferPricing(item: OfferPricingFields): ResolvedOfferPricing {
  const listPrice = toNum(item.price);
  const original = toNum(item.originalPrice) ?? listPrice ?? 0;
  const final =
    toNum(item.finalPrice) ??
    toNum(item.agreedPrice) ??
    listPrice ??
    0;
  let discountAmount =
    toNum(item.discountAmount) ?? (original > final ? original - final : 0);
  let discountPercent =
    toNum(item.discountPercent) ??
    (original > 0 ? Math.round((discountAmount / original) * 1000) / 10 : 0);
  const hasDiscount =
    item.hasDiscount === true || (discountAmount > 0 && final < original);
  const couponCode = item.couponCode?.trim() || undefined;

  if (!hasDiscount) {
    const single = final > 0 ? final : original > 0 ? original : undefined;
    return {
      hasDiscount: false,
      originalPrice: single,
      finalPrice: single,
      discountAmount: 0,
      discountPercent: 0,
    };
  }

  if (discountAmount <= 0 && original > final) {
    discountAmount = original - final;
  }
  if (
    (discountPercent == null || discountPercent <= 0) &&
    original > 0 &&
    discountAmount > 0
  ) {
    discountPercent = Math.round((discountAmount / original) * 1000) / 10;
  }

  return {
    hasDiscount: true,
    originalPrice: original > 0 ? original : undefined,
    finalPrice: final > 0 ? final : undefined,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    discountPercent: discountPercent > 0 ? discountPercent : undefined,
    couponCode,
  };
}

export function resolveOfferDisplayPrice(item: OfferPricingFields): number {
  const pricing = resolveOfferPricing(item);
  return pricing.finalPrice ?? pricing.originalPrice ?? 0;
}

export function resolveOfferOriginalPrice(
  item: OfferPricingFields,
): number | undefined {
  const pricing = resolveOfferPricing(item);
  return pricing.originalPrice;
}

export function offerPriceHasDiscount(item: OfferPricingFields): boolean {
  return resolveOfferPricing(item).hasDiscount;
}

export function formatOfferMoney(amount?: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toLocaleString("tr-TR")} ₺`;
}

export function formatDiscountLine(pricing: ResolvedOfferPricing): string | null {
  if (!pricing.hasDiscount) return null;
  const parts: string[] = ["Kupon indirimi"];
  if (pricing.discountPercent != null && pricing.discountPercent > 0) {
    parts.push(`%${pricing.discountPercent}`);
  }
  if (pricing.discountAmount != null && pricing.discountAmount > 0) {
    parts.push(`(−${formatOfferMoney(pricing.discountAmount)})`);
  }
  const line = parts.join(" ");
  return pricing.couponCode ? `${line} · ${pricing.couponCode}` : line;
}
