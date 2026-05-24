"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ServiceAvailabilityPanel } from "@/src/components/availability/ServiceAvailabilityPanel";
import { OfferRequestModal } from "@/src/components/marketplace/OfferRequestModal";
import { StartConversationModal } from "@/src/components/messaging/StartConversationModal";
import { ServiceCoverImage } from "@/src/components/marketplace/ServiceCoverImage";
import { ServiceReviewsSection } from "@/src/components/reviews/ServiceReviewsSection";
import { StarRating, formatRatingDisplay } from "@/src/components/reviews/StarRating";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useToast } from "@/src/contexts/ToastContext";
import { useCustomerActionGuard } from "@/src/hooks/useCustomerActionGuard";
import {
  addFavorite,
  fetchFavorites,
  fetchServiceById,
  removeFavorite,
} from "@/src/lib/api";
import { trackServiceView } from "@/src/lib/api/vendorIntelligence";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { MarketplaceItem } from "@/src/lib/api/types";
import { getServiceGalleryUrls } from "@/src/lib/serviceImage";
import { AvailabilityHeatmapPanel } from "@/src/components/premium/AvailabilityHeatmapPanel";
import { ServiceBadgeChips } from "@/src/components/premium/ServiceBadgeChips";
import { ServiceMediaGallery } from "@/src/components/premium/ServiceMediaGallery";
import {
  featuredBadgeClass,
  isPremiumVendor,
  premiumBadgeClass,
} from "@/src/lib/marketplacePremium";
import { formatBadgeLabel } from "@/src/lib/premiumLabels";
import {
  btnPrimary,
  btnSecondary,
  glassCard,
  skeletonClass,
} from "@/src/lib/ui";

function serviceIdOf(service: MarketplaceItem): string | undefined {
  const id = service.vendorServiceId ?? service.id;
  return id != null ? String(id) : undefined;
}

export function ServiceDetailView() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const returnPath = id ? `/services/${encodeURIComponent(id)}` : "/marketplace";
  const {
    requireCustomerAction,
    authPromptModal,
    canPerformCustomerAction,
  } = useCustomerActionGuard({ returnPath });
  const toast = useToast();

  const [service, setService] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [offerPrefillDate, setOfferPrefillDate] = useState<string | undefined>();

  const canReview = canPerformCustomerAction;

  const load = useCallback(async () => {
    if (!id) {
      setError("Geçersiz hizmet adresi.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchServiceById(id);
      setService(detail);
      const gallery = getServiceGalleryUrls(detail);
      setActiveImage(gallery[0] ?? null);
      setIsFavorite(detail.isFavorite === true);
      void trackServiceView(id).catch((e) => {
        console.log("track-view failed", e);
      });
    } catch (e) {
      if (e instanceof ApiError) console.log("Service detail failed", e.body);
      setService(null);
      setError(
        formatApiErrorMessage(e, "Hizmet detayı yüklenemedi."),
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canPerformCustomerAction || !service) return;
    fetchFavorites()
      .then((list) => {
        const sid = serviceIdOf(service);
        if (!sid) return;
        setIsFavorite(
          list.some((f) => String(f.vendorServiceId) === sid) || service.isFavorite === true,
        );
      })
      .catch(() => {});
  }, [canPerformCustomerAction, service]);

  const galleryUrls = useMemo(
    () => (service ? getServiceGalleryUrls(service) : []),
    [service],
  );

  const title = service?.serviceTitle ?? service?.title ?? "Hizmet";
  const vendor = service?.vendorName ?? "İşletme";
  const categoryName = service?.categoryName ?? service?.category;
  const price = service?.price ?? service?.basePrice ?? service?.minPrice;
  const rating = service?.rating ?? service?.averageRating;
  const capacity =
    service?.capacityMin != null && service?.capacityMax != null
      ? `${service.capacityMin}–${service.capacityMax} kişi`
      : service?.guestCapacity != null
        ? `${service.guestCapacity} kişi`
        : null;

  function openOffer(prefillDate?: string) {
    if (!requireCustomerAction()) return;
    setOfferPrefillDate(prefillDate);
    setOfferOpen(true);
  }

  function openMessage() {
    if (!requireCustomerAction()) return;
    setMessageOpen(true);
  }

  async function toggleFavorite() {
    if (!requireCustomerAction()) return;
    const sid = service ? serviceIdOf(service) : undefined;
    if (!sid) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(sid);
        setIsFavorite(false);
        toast.success("Favorilerden kaldırıldı.");
      } else {
        await addFavorite(sid);
        setIsFavorite(true);
        toast.success("Favorilere eklendi.");
      }
    } catch (err) {
      if (err instanceof ApiError) console.log("Favorite failed", err.body);
      toast.error(formatApiErrorMessage(err, "Favori işlemi başarısız."));
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <DemoShell title="Hizmet Detayı" subtitle="Hizmet bilgileri ve teklif isteği.">
      <div className="mb-6">
        <Link href="/marketplace" className={btnSecondary}>
          ← Marketplace
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className={`${skeletonClass} aspect-[16/9] w-full max-w-4xl`} />
          <div className={`${skeletonClass} h-40 w-full`} />
        </div>
      ) : null}

      {!loading && error ? (
        <EmptyState
          title="Hizmet yüklenemedi"
          description={error}
          actionLabel="Marketplace'e dön"
          onAction={() => {
            window.location.href = "/marketplace";
          }}
        />
      ) : null}

      {!loading && !error && !service ? (
        <EmptyState
          title="Hizmet bulunamadı"
          description="Bu hizmet kaldırılmış veya mevcut değil olabilir."
          actionLabel="Marketplace'e dön"
          onAction={() => {
            window.location.href = "/marketplace";
          }}
        />
      ) : null}

      {!loading && !error && service ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className={`${glassCard} overflow-hidden p-0`}>
              <div className="relative aspect-[16/9] w-full bg-[#0a0612]">
                <ServiceCoverImage
                  service={service}
                  alt={title}
                  src={activeImage ?? undefined}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06040c]/80 via-transparent to-[#06040c]/30"
                  aria-hidden
                />
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  {service.isFeatured ? (
                    <span className={featuredBadgeClass}>Öne Çıkan</span>
                  ) : null}
                  {isPremiumVendor(service) ? (
                    <span className={premiumBadgeClass}>Premium</span>
                  ) : null}
                  {(service.badges ?? [])
                    .filter((b) => !b.toLowerCase().includes("premium"))
                    .map((b) => (
                      <span
                        key={b}
                        className="inline-flex rounded-full border border-violet-400/25 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100"
                      >
                        {formatBadgeLabel(b)}
                      </span>
                    ))}
                </div>
              </div>
              {galleryUrls.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3">
                  {galleryUrls.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(url)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                        activeImage === url
                          ? "border-violet-400/60 ring-2 ring-violet-400/30"
                          : "border-white/10 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={glassCard}>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
                {categoryName ?? "Kategori"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 text-base text-violet-100/90">
                {vendor}
              </p>
              <ServiceBadgeChips badges={service.badges} className="mt-3" />
              {(service.city || service.district) && (
                <p className="mt-3 text-sm text-zinc-400">
                  {[service.city, service.district].filter(Boolean).join(" · ")}
                </p>
              )}
              {service.description ? (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                  {service.description}
                </p>
              ) : (
                <p className="mt-6 text-sm text-zinc-500">Açıklama eklenmemiş.</p>
              )}
            </div>

            {id ? (
              <>
                <ServiceMediaGallery serviceId={id} />
                <AvailabilityHeatmapPanel variant="service" serviceId={id} />
                <ServiceReviewsSection
                  serviceId={id}
                  canSubmit={canReview}
                  fallbackRating={rating}
                  fallbackReviewCount={service.reviewCount}
                />
              </>
            ) : null}
          </div>

          <aside className={`${glassCard} h-fit space-y-4`}>
            {price != null && (
              <div>
                <p className="text-xs text-zinc-500">Başlangıç fiyatı</p>
                <p className="text-2xl font-semibold text-white">
                  {price.toLocaleString("tr-TR")} ₺
                </p>
              </div>
            )}
            {rating != null || service.reviewCount != null ? (
              <div className="flex items-center gap-3">
                {rating != null ? (
                  <StarRating value={rating} size="sm" />
                ) : null}
                <p className="text-sm text-zinc-300">
                  {rating != null ? (
                    <strong className="text-white">
                      {formatRatingDisplay(rating)}
                    </strong>
                  ) : null}
                  {service.reviewCount != null
                    ? `${rating != null ? " · " : ""}${service.reviewCount} değerlendirme`
                    : ""}
                </p>
              </div>
            ) : null}
            {capacity ? (
              <p className="text-sm text-zinc-300">
                Kapasite: <strong className="text-white">{capacity}</strong>
              </p>
            ) : null}

            {id ? (
              <ServiceAvailabilityPanel
                serviceId={id}
                onStartOfferForDate={(date) => openOffer(date)}
              />
            ) : null}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                className={btnSecondary}
                onClick={openMessage}
              >
                Mesaj Gönder
              </button>
              <button type="button" className={btnPrimary} onClick={() => openOffer()}>
                Teklif İste
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={() => void toggleFavorite()}
                disabled={favLoading}
              >
                {favLoading
                  ? "Kaydediliyor…"
                  : isFavorite
                    ? "Favorilerden çıkar"
                    : "Favorilere ekle"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <OfferRequestModal
        item={service}
        open={offerOpen}
        initialEventDate={offerPrefillDate}
        onClose={() => {
          setOfferOpen(false);
          setOfferPrefillDate(undefined);
        }}
        onSuccess={(msg) => toast.success(msg)}
      />
      <StartConversationModal
        item={service}
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        onSuccess={() =>
          toast.success("Konuşma başlatıldı. Mesajlar panelinizde.")
        }
      />
      {authPromptModal}
    </DemoShell>
  );
}
