"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MarketplaceServiceCard } from "@/src/components/marketplace/MarketplaceServiceCard";
import { OfferRequestModal } from "@/src/components/marketplace/OfferRequestModal";
import { useCustomerActionGuard } from "@/src/hooks/useCustomerActionGuard";
import { useToast } from "@/src/contexts/ToastContext";
import {
  fetchCategories,
  fetchMarketplace,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { Category, MarketplaceItem } from "@/src/lib/api/types";
import { ActiveCampaignBanner } from "@/src/components/commerce/ActiveCampaignBanner";
import { MarketplaceEducationBanner } from "@/src/components/help/MarketplaceEducationBanner";
import { buildMarketplaceHref } from "@/src/lib/marketplaceUrl";
import { sortMarketplaceItems } from "@/src/lib/marketplacePremium";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

export function HomeMarketplacePreview() {
  const router = useRouter();
  const toast = useToast();
  const { requireCustomerAction, authPromptModal } = useCustomerActionGuard();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [offerItem, setOfferItem] = useState<MarketplaceItem | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items: raw } = await fetchMarketplace({
        pageSize: "6",
        sortBy: "popular",
      });
      setItems(sortMarketplaceItems(raw, "popular"));
    } catch (err) {
      logApiError("Home marketplace preview", err);
      setItems([]);
      setError(formatUiErrorMessage(err, "Hizmetler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, [loadServices]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      buildMarketplaceHref({ city, categoryId, keyword }),
    );
  }

  function openOffer(item: MarketplaceItem) {
    if (!requireCustomerAction()) return;
    setOfferItem(item);
  }

  return (
    <section
      id="one-cikan-hizmetler"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
              Canlı marketplace
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Öne Çıkan Hizmetler
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Gerçek işletmelerden güncel hizmet listesi — detayları inceleyin veya
              teklif isteyin.
            </p>
          </div>
          <Link href="/marketplace" className={`${btnSecondary} shrink-0 text-center`}>
            Tüm Marketplace&apos;i Gör
          </Link>
        </div>

        <div className="mt-8 space-y-0">
          <ActiveCampaignBanner />
          <MarketplaceEducationBanner />
        </div>

        <form
          onSubmit={handleSearch}
          className={`${glassCard} mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto]`}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-500">Şehir</span>
            <input
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="İstanbul"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-500">Kategori</span>
            <select
              className={selectClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id ?? "")}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs text-zinc-500">Anahtar kelime</span>
            <input
              className={inputClass}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Düğün, DJ, catering…"
            />
          </label>
          <button type="submit" className={`${btnPrimary} sm:self-end`}>
            Ara
          </button>
        </form>

        {error ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[22rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            Henüz listelenecek hizmet yok.{" "}
            <Link href="/marketplace" className="text-violet-300 hover:text-violet-200">
              Marketplace&apos;e gidin
            </Link>
          </p>
        ) : (
          <div className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <MarketplaceServiceCard
                key={String(item.vendorServiceId ?? item.id ?? i)}
                item={item}
                showFavoriteButton
                showOfferButton
                showMessageButton={false}
                onFavoriteToggle={() => {
                  requireCustomerAction();
                }}
                onOfferRequest={() => openOffer(item)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/marketplace" className={btnPrimary}>
            Tüm Marketplace&apos;i Gör →
          </Link>
        </div>
      </div>

      <OfferRequestModal
        item={offerItem}
        open={offerItem != null}
        onClose={() => setOfferItem(null)}
        onSuccess={(msg) => toast.success(msg)}
      />
      {authPromptModal}
    </section>
  );
}
