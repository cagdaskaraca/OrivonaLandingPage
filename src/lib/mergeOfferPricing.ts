import type { OfferPricingFields } from "@/src/lib/offerPricing";
import { recordBool, recordNum, recordStr } from "@/src/lib/normalize";

type PricingSlice = OfferPricingFields & { listPrice?: number };

function sliceFromRecord(
  record: Record<string, unknown> | undefined,
): PricingSlice {
  if (!record) return {};
  return {
    originalPrice: recordNum(record, "originalPrice", "OriginalPrice"),
    finalPrice:
      recordNum(record, "finalPrice", "FinalPrice") ??
      recordNum(record, "discountedPrice", "DiscountedPrice"),
    agreedPrice: recordNum(record, "agreedPrice", "AgreedPrice"),
    hasDiscount: recordBool(record, "hasDiscount", "HasDiscount"),
    discountAmount: recordNum(record, "discountAmount", "DiscountAmount"),
    discountPercent: recordNum(record, "discountPercent", "DiscountPercent"),
    couponCode:
      recordStr(record, "couponCode", "CouponCode") ??
      recordStr(record, "appliedCouponCode", "AppliedCouponCode"),
    listPrice: recordNum(record, "price", "Price"),
    displayPrice: recordNum(record, "displayPrice", "DisplayPrice"),
  };
}

/** Kök teklif + vendorOffer nested alanlarını tek fiyat objesinde birleştirir. */
export function mergeOfferPricingFields(
  root: Record<string, unknown>,
  nested?: Record<string, unknown>,
): OfferPricingFields {
  const rootSlice = sliceFromRecord(root);
  const nestedSlice = sliceFromRecord(nested);

  const originalPrice =
    nestedSlice.originalPrice ??
    rootSlice.originalPrice ??
    nestedSlice.listPrice ??
    rootSlice.listPrice ??
    recordNum(root, "vendorOfferPrice", "VendorOfferPrice");

  const finalPrice =
    nestedSlice.finalPrice ??
    rootSlice.finalPrice ??
    nestedSlice.agreedPrice ??
    rootSlice.agreedPrice;

  const couponCode = nestedSlice.couponCode ?? rootSlice.couponCode;
  let hasDiscount = nestedSlice.hasDiscount ?? rootSlice.hasDiscount;

  const discountAmount =
    nestedSlice.discountAmount ?? rootSlice.discountAmount;
  const discountPercent =
    nestedSlice.discountPercent ?? rootSlice.discountPercent;

  if (
    hasDiscount !== true &&
    originalPrice != null &&
    finalPrice != null &&
    finalPrice < originalPrice
  ) {
    hasDiscount = true;
  }
  if (hasDiscount !== true && couponCode && finalPrice != null && originalPrice != null) {
    hasDiscount = finalPrice < originalPrice;
  }

  const hasDiscountData =
    hasDiscount === true ||
    finalPrice != null ||
    Boolean(couponCode) ||
    (originalPrice != null &&
      finalPrice != null &&
      finalPrice < originalPrice);

  return {
    originalPrice,
    finalPrice,
    agreedPrice: nestedSlice.agreedPrice ?? rootSlice.agreedPrice,
    displayPrice: nestedSlice.displayPrice ?? rootSlice.displayPrice,
    hasDiscount,
    discountAmount,
    discountPercent,
    couponCode,
    price: hasDiscountData
      ? undefined
      : (nestedSlice.listPrice ??
        rootSlice.listPrice ??
        recordNum(root, "vendorOfferPrice", "VendorOfferPrice") ??
        recordNum(root, "offeredPrice", "OfferedPrice")),
  };
}
