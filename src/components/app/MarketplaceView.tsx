"use client";

import { useCallback, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { fetchMarketplace } from "@/src/lib/api";
import type { MarketplaceFilters, MarketplaceItem } from "@/src/lib/api/types";
import { ApiError } from "@/src/lib/api/client";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

const emptyFilters: MarketplaceFilters = {
  city: "",
  district: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  guestCount: "",
  keyword: "",
};

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  const title = item.serviceTitle ?? item.title ?? "Hizmet";
  const vendor = item.vendorName ?? "İşletme";
  const price = item.price ?? item.minPrice;
  const rating = item.rating ?? item.averageRating;

  return (
    <article className={`${glassCard} flex flex-col gap-3`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
          {item.category ?? "Kategori"}
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
        <p className="text-sm leading-relaxed text-zinc-400 line-clamp-3">
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
            Puan: <strong className="text-white">{rating}</strong>
          </span>
        )}
        {item.guestCapacity != null && (
          <span>Kapasite: {item.guestCapacity} kişi</span>
        )}
      </div>
    </article>
  );
}

export function MarketplaceView() {
  const [filters, setFilters] = useState<MarketplaceFilters>(emptyFilters);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const load = useCallback(async (next: MarketplaceFilters) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const { response, items } = await fetchMarketplace(next);
      console.log("Marketplace Response", response.data);
      setItems(items);
    } catch (e) {
      setItems([]);
      setError(
        e instanceof ApiError
          ? e.message
          : "Marketplace verisi yüklenemedi. API çalışıyor mu?",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(filters);
  }

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
            ["categoryId", "Kategori"],
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
        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Yükleniyor…" : "Ara"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-zinc-400">Sonuçlar yükleniyor…</p>
        </div>
      ) : null}

      {!loading && searched && items.length === 0 && !error ? (
        <div
          className={`${glassCard} text-center text-sm text-zinc-400`}
        >
          Filtrelere uygun hizmet bulunamadı.
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <MarketplaceCard
              key={String(item.id ?? item.vendorId ?? i)}
              item={item}
            />
          ))}
        </div>
      ) : null}

      {!searched && !loading ? (
        <p className="text-center text-sm text-zinc-500">
          Aramaya başlamak için filtreleri doldurup Ara&apos;ya tıklayın.
        </p>
      ) : null}
    </DemoShell>
  );
}
