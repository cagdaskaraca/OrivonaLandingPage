"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_CATEGORY_IMAGE,
  getServiceImageUrl,
  isLocalMarketplaceImage,
} from "@/src/lib/serviceImage";
import type { MarketplaceItem } from "@/src/lib/api/types";
import {
  featuredBadgeClass,
  featuredCardClasses,
  isPremiumVendor,
  premiumBadgeClass,
} from "@/src/lib/marketplacePremium";
import { ServiceBadgeChips } from "@/src/components/premium/ServiceBadgeChips";
import { badgeClass, btnPrimary, btnSecondary, cardHover, glassCard } from "@/src/lib/ui";

type MarketplaceServiceCardProps = {
  item: MarketplaceItem;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onFavoriteToggle?: () => void;
  onOfferRequest?: () => void;
  onMessageSend?: () => void;
  showOfferButton?: boolean;
  showMessageButton?: boolean;
  showFavoriteButton?: boolean;
};

export function MarketplaceServiceCard({
  item,
  isFavorite,
  favoriteLoading,
  onFavoriteToggle,
  onOfferRequest,
  onMessageSend,
  showOfferButton = true,
  showMessageButton = false,
  showFavoriteButton = true,
}: MarketplaceServiceCardProps) {
  const title = item.serviceTitle ?? item.title ?? "Hizmet";
  const vendor = item.vendorName ?? "İşletme";
  const categoryName = item.categoryName ?? item.category;
  const price = item.price ?? item.basePrice ?? item.minPrice;
  const rating = item.rating ?? item.averageRating;
  const serviceId = item.vendorServiceId ?? item.id;
  const detailHref =
    serviceId != null ? `/services/${encodeURIComponent(String(serviceId))}` : null;
  const capacity =
    item.capacityMin != null && item.capacityMax != null
      ? `${item.capacityMin}–${item.capacityMax}`
      : item.guestCapacity != null
        ? String(item.guestCapacity)
        : null;

  const [imageSrc, setImageSrc] = useState(() => getServiceImageUrl(item));

  useEffect(() => {
    setImageSrc(getServiceImageUrl(item));
  }, [
    item.coverImageUrl,
    item.imageUrl,
    item.categoryName,
    item.category,
  ]);

  function handleImageError() {
    if (imageSrc !== DEFAULT_CATEGORY_IMAGE) {
      setImageSrc(DEFAULT_CATEGORY_IMAGE);
    }
  }

  const useUnoptimized =
    !isLocalMarketplaceImage(imageSrc) &&
    (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"));

  const featured = item.isFeatured === true;
  const premium = isPremiumVendor(item);
  const apiBadges = (item.badges ?? []).filter(
    (b) =>
      !b.toLowerCase().includes("premium") &&
      b !== "Öne Çıkan" &&
      !b.toLowerCase().includes("featured"),
  );

  const actionBtnBase =
    "flex min-h-[2.5rem] w-full min-w-0 flex-1 basis-0 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold sm:text-sm";
  const hasMeta = price != null || rating != null || capacity != null;
  const showActions =
    detailHref != null ||
    showMessageButton ||
    showOfferButton;

  return (
    <article
      className={`${glassCard} ${cardHover} ${featuredCardClasses(featured)} group relative flex h-full flex-col overflow-hidden p-0`}
    >
      {featured ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-2xl bg-gradient-to-br from-amber-400/[0.07] via-transparent to-violet-500/[0.08]"
          aria-hidden
        />
      ) : null}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#0a0612]">
        {detailHref ? (
          <Link href={detailHref} className="absolute inset-0 z-0">
            <span className="sr-only">{title} detayına git</span>
          </Link>
        ) : null}
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={useUnoptimized}
          onError={handleImageError}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06040c]/75 via-[#06040c]/10 to-[#06040c]/25"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {featured ? (
            <span className={featuredBadgeClass}>Öne Çıkan</span>
          ) : null}
          {premium ? <span className={premiumBadgeClass}>Premium</span> : null}
          {apiBadges.slice(0, featured && premium ? 1 : 2).map((b) => (
            <span key={b} className={badgeClass}>
              {b}
            </span>
          ))}
        </div>
        {showFavoriteButton && onFavoriteToggle ? (
          <button
            type="button"
            aria-label={isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
            className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-sm backdrop-blur-md transition hover:bg-black/70 disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavoriteToggle();
            }}
            disabled={favoriteLoading}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        ) : null}
      </div>
      <div className="relative z-[2] flex min-h-0 flex-1 flex-col p-5">
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
              {categoryName ?? "Kategori"}
            </p>
            {detailHref ? (
              <Link href={detailHref}>
                <h3
                  className={`mt-1 line-clamp-2 text-lg font-semibold transition hover:text-violet-100 ${
                    featured ? "text-amber-50" : "text-white"
                  }`}
                >
                  {title}
                </h3>
              </Link>
            ) : (
              <h3
                className={`mt-1 line-clamp-2 text-lg font-semibold ${
                  featured ? "text-amber-50" : "text-white"
                }`}
              >
                {title}
              </h3>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span className="line-clamp-1">{vendor}</span>
              {premium && !featured ? (
                <span className={premiumBadgeClass}>Premium</span>
              ) : null}
            </p>
          </div>
          <ServiceBadgeChips badges={item.badges} className="mt-1" />
          {(item.city || item.district) && (
            <p className="text-xs text-zinc-500">
              {[item.city, item.district].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="min-h-[2.75rem]">
            {item.description ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>

        {hasMeta ? (
          <div className="mt-4 shrink-0 border-t border-white/10 pt-3">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-zinc-300">
              {price != null && (
                <span>
                  Fiyat:{" "}
                  <strong className="text-white">
                    {price.toLocaleString("tr-TR")} ₺
                  </strong>
                </span>
              )}
              {rating != null && (
                <span>
                  ★ {rating}
                  {item.reviewCount != null ? ` (${item.reviewCount})` : ""}
                </span>
              )}
              {capacity != null && <span>Kapasite: {capacity} kişi</span>}
            </div>
          </div>
        ) : null}

        {showActions ? (
          <div
            className={`flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-center ${
              hasMeta ? "mt-3" : "mt-4 border-t border-white/10 pt-3"
            }`}
          >
            {detailHref ? (
              <Link
                href={detailHref}
                className={`${btnSecondary} ${actionBtnBase}`}
              >
                Detayları gör
              </Link>
            ) : null}
            {showMessageButton && onMessageSend ? (
              <button
                type="button"
                className={`${btnSecondary} ${actionBtnBase}`}
                onClick={onMessageSend}
              >
                Mesaj Gönder
              </button>
            ) : null}
            {showOfferButton && onOfferRequest ? (
              <button
                type="button"
                className={`${btnPrimary} ${actionBtnBase}`}
                onClick={onOfferRequest}
              >
                Teklif İste
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
