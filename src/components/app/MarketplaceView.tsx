"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { filtersFromSearchParams } from "@/src/lib/marketplaceUrl";
import { DemoShell } from "@/src/components/app/DemoShell";
import { MarketplaceServiceCard } from "@/src/components/marketplace/MarketplaceServiceCard";
import { OfferRequestModal } from "@/src/components/marketplace/OfferRequestModal";
import { StartConversationModal } from "@/src/components/messaging/StartConversationModal";
import { ActiveCampaignBanner } from "@/src/components/commerce/ActiveCampaignBanner";
import { MarketplaceEducationBanner } from "@/src/components/help/MarketplaceEducationBanner";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { SkeletonGrid } from "@/src/components/ui/SkeletonGrid";
import { useCustomerActionGuard } from "@/src/hooks/useCustomerActionGuard";
import { useToast } from "@/src/contexts/ToastContext";
import {
  addFavorite,
  buildMarketplaceQueryParams,
  fetchCategories,
  fetchFavorites,
  fetchMarketplace,
  removeFavorite,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  Category,
  MarketplaceFilters,
  MarketplaceItem,
} from "@/src/lib/api/types";
import {
  MARKETPLACE_SORT_OPTIONS,
  sortMarketplaceItems,
} from "@/src/lib/marketplacePremium";
import { btnPrimary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

const emptyFilters: MarketplaceFilters = {
  city: "",
  district: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  guestCount: "",
  keyword: "",
  sortBy: "",
};

export function MarketplaceView() {
  const searchParams = useSearchParams();
  const initialFromUrl = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const urlBootstrapped = useRef(false);
  const { requireCustomerAction, authPromptModal, canPerformCustomerAction } =
    useCustomerActionGuard();
  const toast = useToast();
  const [filters, setFilters] = useState<MarketplaceFilters>(() => ({
    ...emptyFilters,
    city: initialFromUrl.city ?? "",
    district: initialFromUrl.district ?? "",
    categoryId: initialFromUrl.categoryId ?? "",
    keyword: initialFromUrl.keyword ?? "",
    minPrice: initialFromUrl.minPrice ?? "",
    maxPrice: initialFromUrl.maxPrice ?? "",
    minRating: initialFromUrl.minRating ?? "",
    guestCount: initialFromUrl.guestCount ?? "",
    sortBy: initialFromUrl.sortBy ?? "",
  }));
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [offerItem, setOfferItem] = useState<MarketplaceItem | null>(null);
  const [messageItem, setMessageItem] = useState<MarketplaceItem | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((e) => console.log("Marketplace categories failed", e));
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!canPerformCustomerAction) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const list = await fetchFavorites();
      setFavoriteIds(
        new Set(
          list
            .map((f) => f.vendorServiceId)
            .filter((id) => id != null)
            .map(String),
        ),
      );
    } catch (e) {
      console.log("Favorites load failed", e);
    }
  }, [canPerformCustomerAction]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const load = useCallback(async (next: MarketplaceFilters) => {
    const params = buildMarketplaceQueryParams(next);
    console.log("Marketplace query params", params);

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { response, items: raw } = await fetchMarketplace(next);
      console.log("Marketplace response", response.data);
      setItems(sortMarketplaceItems(raw, next.sortBy ?? ""));
    } catch (e) {
      if (e instanceof ApiError) console.log("Marketplace fetch failed", e.body);
      setItems([]);
      setError(
        formatApiErrorMessage(
          e,
          "Marketplace verisi yüklenemedi. API çalışıyor mu?",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlBootstrapped.current) return;
    urlBootstrapped.current = true;
    const hasQuery = [
      initialFromUrl.city,
      initialFromUrl.district,
      initialFromUrl.categoryId,
      initialFromUrl.keyword,
      initialFromUrl.minPrice,
      initialFromUrl.maxPrice,
      initialFromUrl.minRating,
      initialFromUrl.guestCount,
      initialFromUrl.sortBy,
    ].some((v) => (v ?? "").trim() !== "");
    if (hasQuery) {
      void load(initialFromUrl);
    }
  }, [initialFromUrl, load]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void load(filters);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    void load(emptyFilters);
  }

  const serviceId = (item: MarketplaceItem) =>
    String(item.vendorServiceId ?? item.id ?? "");

  async function toggleFavorite(item: MarketplaceItem) {
    if (!requireCustomerAction()) return;
    const id = item.vendorServiceId ?? item.id;
    if (id == null) return;
    const key = String(id);
    setFavLoadingId(key);
    try {
      if (favoriteIds.has(key)) {
        await removeFavorite(id);
        setFavoriteIds((prev) => {
          const n = new Set(prev);
          n.delete(key);
          return n;
        });
        toast.success("Favorilerden kaldırıldı.");
      } else {
        await addFavorite(id);
        setFavoriteIds((prev) => new Set(prev).add(key));
        toast.success("Favorilere eklendi.");
      }
    } catch (err) {
      if (err instanceof ApiError) console.log("Favorite toggle failed", err.body);
      toast.error(formatApiErrorMessage(err, "Favori işlemi başarısız."));
    } finally {
      setFavLoadingId(null);
    }
  }

  function openOffer(item: MarketplaceItem) {
    if (!requireCustomerAction()) return;
    setOfferItem(item);
  }

  function openMessage(item: MarketplaceItem) {
    if (!requireCustomerAction()) return;
    setMessageItem(item);
  }

  const mergedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        isFavorite: favoriteIds.has(serviceId(item)),
      })),
    [items, favoriteIds],
  );

  return (
    <DemoShell
      title="Marketplace"
      subtitle="Şehir, kategori ve bütçe filtreleriyle doğrulanmış hizmet sağlayıcılarını keşfedin."
    >
      <ActiveCampaignBanner />
      <MarketplaceEducationBanner />
      <form
        onSubmit={handleSubmit}
        className={`${glassCard} mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}
      >
        {(
          [
            ["city", "Şehir"],
            ["district", "İlçe"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">{label}</span>
            <input
              className={inputClass}
              value={filters[key] ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, [key]: e.target.value }))
              }
            />
          </label>
        ))}
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Kategori</span>
          <select
            className={selectClass}
            value={filters.categoryId ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoryId: e.target.value }))
            }
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((c) => (
              <option key={String(c.id)} value={String(c.id ?? "")}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {(
          [
            ["keyword", "Anahtar kelime"],
            ["minPrice", "Min fiyat"],
            ["maxPrice", "Max fiyat"],
            ["minRating", "Min puan"],
            ["guestCount", "Misafir sayısı"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">{label}</span>
            <input
              className={inputClass}
              value={filters[key] ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, [key]: e.target.value }))
              }
            />
          </label>
        ))}
        <label className="block text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-xs text-zinc-400">Sıralama</span>
          <select
            className={selectClass}
            value={filters.sortBy ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value }))
            }
          >
            {MARKETPLACE_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Yükleniyor…" : "Ara"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mb-6 whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? <SkeletonGrid /> : null}

      {!loading && searched && mergedItems.length === 0 && !error ? (
        <EmptyState
          icon={EMPTY_STATE_PRESETS.marketplaceSearch.icon}
          title="Filtrelere uygun hizmet bulunamadı"
          description="Farklı şehir veya kategori deneyin."
          actionLabel={EMPTY_STATE_PRESETS.marketplaceSearch.actionLabel}
          onAction={clearFilters}
        />
      ) : null}

      {!loading && mergedItems.length > 0 ? (
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mergedItems.map((item, i) => (
            <MarketplaceServiceCard
              key={serviceId(item) || i}
              item={item}
              isFavorite={item.isFavorite}
              favoriteLoading={favLoadingId === serviceId(item)}
              onFavoriteToggle={() => void toggleFavorite(item)}
              showFavoriteButton
              showOfferButton
              showMessageButton
              onOfferRequest={() => openOffer(item)}
              onMessageSend={() => openMessage(item)}
            />
          ))}
        </div>
      ) : null}

      {!searched && !loading ? (
        <p className="text-center text-sm text-zinc-500">
          Aramaya başlamak için filtreleri doldurup Ara&apos;ya tıklayın.
        </p>
      ) : null}

      <OfferRequestModal
        item={offerItem}
        open={offerItem != null}
        onClose={() => setOfferItem(null)}
        onSuccess={(msg) => toast.success(msg)}
      />
      <StartConversationModal
        item={messageItem}
        open={messageItem != null}
        onClose={() => setMessageItem(null)}
        onSuccess={() =>
          toast.success("Konuşma başlatıldı. Mesajlar panelinizde.")
        }
      />
      {authPromptModal}
    </DemoShell>
  );
}
