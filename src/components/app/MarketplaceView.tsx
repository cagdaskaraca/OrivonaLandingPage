"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { MarketplaceServiceCard } from "@/src/components/marketplace/MarketplaceServiceCard";
import { OfferRequestModal } from "@/src/components/marketplace/OfferRequestModal";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SkeletonGrid } from "@/src/components/ui/SkeletonGrid";
import { useAuth } from "@/src/contexts/AuthContext";
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

const SORT_OPTIONS = [
  { value: "", label: "Sıralama yok" },
  { value: "price_asc", label: "Fiyat (artan)" },
  { value: "price_desc", label: "Fiyat (azalan)" },
  { value: "rating_desc", label: "Puan" },
];

export function MarketplaceView() {
  const { isAuthenticated, role } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState<MarketplaceFilters>(emptyFilters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [offerItem, setOfferItem] = useState<MarketplaceItem | null>(null);

  const canFavorite = isAuthenticated && role === "Customer";
  const canOffer = isAuthenticated && role === "Customer";

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((e) => console.log("Marketplace categories failed", e));
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!canFavorite) {
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
  }, [canFavorite]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const load = useCallback(
    async (next: MarketplaceFilters) => {
      const params = buildMarketplaceQueryParams(next);
      console.log("Marketplace query params", params);

      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const { response, items } = await fetchMarketplace(next);
        console.log("Marketplace response", response.data);
        setItems(items);
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
    },
    [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(filters);
  }

  function clearFilters() {
    setFilters(emptyFilters);
    load(emptyFilters);
  }

  const serviceId = (item: MarketplaceItem) =>
    String(item.vendorServiceId ?? item.id ?? "");

  async function toggleFavorite(item: MarketplaceItem) {
    const id = item.vendorServiceId ?? item.id;
    if (id == null || !canFavorite) return;
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
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Sıralama</span>
          <select
            className={selectClass}
            value={filters.sortBy ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value }))
            }
          >
            {SORT_OPTIONS.map((o) => (
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
          title="Filtrelere uygun hizmet bulunamadı"
          description="Farklı şehir veya kategori deneyin."
          actionLabel="Filtreleri temizle"
          onAction={clearFilters}
        />
      ) : null}

      {!loading && mergedItems.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mergedItems.map((item, i) => (
            <MarketplaceServiceCard
              key={serviceId(item) || i}
              item={item}
              isFavorite={item.isFavorite}
              favoriteLoading={favLoadingId === serviceId(item)}
              onFavoriteToggle={
                canFavorite ? () => toggleFavorite(item) : undefined
              }
              showOfferButton={canOffer}
              onOfferRequest={
                canOffer ? () => setOfferItem(item) : undefined
              }
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
        onSuccess={() => toast.success("Teklif isteğiniz gönderildi.")}
      />
    </DemoShell>
  );
}
