"use client";

import {
  formatDiscountLine,
  formatOfferMoney,
  resolveOfferPricing,
  type OfferPricingFields,
  type ResolvedOfferPricing,
} from "@/src/lib/offerPricing";

type OfferPriceBreakdownProps = {
  pricing: OfferPricingFields | ResolvedOfferPricing;
  /** sm: checklist / bütçe satırı; md: teklif kartı; lg: vurgulu */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const FINAL_SIZE = {
  sm: "text-sm font-semibold",
  md: "text-lg font-bold",
  lg: "text-xl font-bold",
} as const;

const ORIGINAL_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

export function OfferPriceBreakdown({
  pricing: input,
  size = "md",
  className = "",
}: OfferPriceBreakdownProps) {
  const pricing =
    "hasDiscount" in input && typeof input.hasDiscount === "boolean"
      ? (input as ResolvedOfferPricing)
      : resolveOfferPricing(input);

  if (pricing.finalPrice == null && pricing.originalPrice == null) {
    return null;
  }

  if (!pricing.hasDiscount) {
    const single = pricing.finalPrice ?? pricing.originalPrice;
    return (
      <p className={`font-semibold text-emerald-300 ${FINAL_SIZE[size]} ${className}`}>
        {formatOfferMoney(single)}
      </p>
    );
  }

  const discountLine = formatDiscountLine(pricing);

  return (
    <div className={`space-y-1 ${className}`}>
      {pricing.originalPrice != null ? (
        <p
          className={`font-medium text-red-400 line-through decoration-red-400/80 ${ORIGINAL_SIZE[size]}`}
        >
          {formatOfferMoney(pricing.originalPrice)}
        </p>
      ) : null}
      {discountLine ? (
        <p className="text-xs font-medium text-amber-200/90">{discountLine}</p>
      ) : null}
      {pricing.finalPrice != null ? (
        <p className={`text-emerald-300 ${FINAL_SIZE[size]}`}>
          {formatOfferMoney(pricing.finalPrice)}
        </p>
      ) : null}
    </div>
  );
}
