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
import { badgeClass, btnPrimary, btnSecondary, cardHover, glassCard } from "@/src/lib/ui";

type MarketplaceServiceCardProps = {
  item: MarketplaceItem;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onFavoriteToggle?: () => void;
  onOfferRequest?: () => void;
  showOfferButton?: boolean;
};

export function MarketplaceServiceCard({
  item,
  isFavorite,
  favoriteLoading,
  onFavoriteToggle,
  onOfferRequest,
  showOfferButton = true,
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

  return (
    <article
      className={`${glassCard} ${cardHover} group flex flex-col overflow-hidden p-0`}
    >
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
        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1">
          {item.isFeatured ? (
            <span className={badgeClass}>Öne Çıkan</span>
          ) : null}
          {(item.badges ?? []).slice(0, 2).map((b) => (
            <span key={b} className={badgeClass}>
              {b}
            </span>
          ))}
        </div>
        {onFavoriteToggle ? (
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
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            {categoryName ?? "Kategori"}
          </p>
          {detailHref ? (
            <Link href={detailHref}>
              <h3 className="mt-1 text-lg font-semibold text-white transition hover:text-violet-100">
                {title}
              </h3>
            </Link>
          ) : (
            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          )}
          <p className="mt-1 text-sm text-zinc-400">{vendor}</p>
        </div>
        {(item.city || item.district) && (
          <p className="text-xs text-zinc-500">
            {[item.city, item.district].filter(Boolean).join(" · ")}
          </p>
        )}
        {item.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {item.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-3 border-t border-white/10 pt-3 text-xs text-zinc-300">
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
        <div className="flex flex-col gap-2 sm:flex-row">
          {detailHref ? (
            <Link href={detailHref} className={`${btnSecondary} text-center`}>
              Detayları gör
            </Link>
          ) : null}
          {showOfferButton && onOfferRequest ? (
            <button type="button" className={btnPrimary} onClick={onOfferRequest}>
              Teklif İste
            </button>
          ) : (
            <span className={`${btnSecondary} pointer-events-none opacity-60`}>
              Giriş yaparak teklif isteyin
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
