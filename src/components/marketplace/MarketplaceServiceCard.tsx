"use client";

import Image from "next/image";
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
  const price = item.price ?? item.basePrice ?? item.minPrice;
  const rating = item.rating ?? item.averageRating;
  const cover = item.coverImageUrl ?? item.imageUrl;
  const capacity =
    item.capacityMin != null && item.capacityMax != null
      ? `${item.capacityMin}–${item.capacityMax}`
      : item.guestCapacity != null
        ? String(item.guestCapacity)
        : null;

  return (
    <article className={`${glassCard} ${cardHover} flex flex-col overflow-hidden p-0`}>
      <div className="relative aspect-[16/10] w-full bg-white/[0.04]">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            Görsel yok
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
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
            className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-sm backdrop-blur-md transition hover:bg-black/70 disabled:opacity-50"
            onClick={onFavoriteToggle}
            disabled={favoriteLoading}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            {item.categoryName ?? item.category ?? "Kategori"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
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
    </article>
  );
}
