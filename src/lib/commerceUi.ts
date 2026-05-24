import type { CouponDiscountType, PromotionType } from "@/src/lib/api/commerce";
import type { MarketplaceItem } from "@/src/lib/api/types";

export const PAYMENT_COMING_SOON =
  "Ödeme altyapısı yakında aktif edilecektir.";

export const PROMOTION_TYPE_OPTIONS: { value: PromotionType; label: string }[] =
  [
    { value: "Featured", label: "Öne Çıkan (Marketplace)" },
    { value: "Homepage", label: "Ana Sayfa" },
    { value: "CategoryBoost", label: "Kategori Boost" },
  ];

export function promotionTypeLabel(type?: string): string {
  switch (type) {
    case "Featured":
      return "Öne Çıkan";
    case "Homepage":
      return "Ana Sayfa";
    case "CategoryBoost":
      return "Kategori Boost";
    default:
      return type ?? "Tanımsız";
  }
}

export const sponsoredBadgeClass =
  "inline-flex rounded-full border border-fuchsia-300/45 bg-gradient-to-r from-fuchsia-500/30 via-violet-500/25 to-violet-600/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fuchsia-100 shadow-[0_0_16px_rgba(192,38,211,0.35)]";

export function isServiceSponsored(item: MarketplaceItem): boolean {
  if (item.isSponsored === true) return true;
  const pt = (item.promotionType ?? "").toLowerCase();
  return (
    pt.includes("homepage") ||
    pt.includes("featured") ||
    pt.includes("sponsor") ||
    (item.badges ?? []).some((b) => {
      const x = b.toLowerCase();
      return x.includes("sponsor") || x.includes("sponsorlu");
    })
  );
}

export function formatDiscountPreview(
  discountType?: CouponDiscountType,
  value?: number,
): string | null {
  if (value == null || value <= 0) return null;
  const t = (discountType ?? "").toLowerCase();
  if (t.includes("percent") || t === "percentage" || t === "%") {
    return `İndirim uygulandı: %${value}`;
  }
  return `İndirim uygulandı: ${value.toLocaleString("tr-TR")} ₺`;
}

export const CAMPAIGN_TARGET_OPTIONS = [
  { value: "All", label: "Tüm platform" },
  { value: "Category", label: "Kategori" },
  { value: "Vendor", label: "İşletme" },
  { value: "Service", label: "Hizmet" },
] as const;
