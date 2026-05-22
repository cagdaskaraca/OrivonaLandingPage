"use client";

import { useEffect, useRef, useState } from "react";
import { AiPlannerResults } from "@/src/components/ai-planner/AiPlannerResults";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  OFFER_REQUEST_SUCCESS_MESSAGE,
  OfferRequestModal,
} from "@/src/components/marketplace/OfferRequestModal";
import {
  fetchAiEventPlan,
  fetchAiRecommendations,
  fetchCategories,
} from "@/src/lib/api";
import type {
  AiEventPlanResult,
  AiRecommendationItem,
  Category,
  MarketplaceItem,
} from "@/src/lib/api/types";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import {
  recommendationToMarketplaceItem,
  type AiPlanFormSnapshot,
} from "@/src/lib/aiPlanner";
import { useToast } from "@/src/contexts/ToastContext";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

export function AiPlannerView() {
  const toast = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [eventType, setEventType] = useState("Düğün");
  const [city, setCity] = useState("İzmir");
  const [district, setDistrict] = useState("Konak");
  const [guestCount, setGuestCount] = useState("120");
  const [budgetMin, setBudgetMin] = useState("200000");
  const [budgetMax, setBudgetMax] = useState("400000");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(["Mekan", "Catering"]);
  const [plan, setPlan] = useState<AiEventPlanResult | null>(null);
  const [fallbackRecs, setFallbackRecs] = useState<AiRecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialMode, setPartialMode] = useState(false);
  const [offerItem, setOfferItem] = useState<MarketplaceItem | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  function toggleCategory(name: string) {
    setSelectedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  const formSnapshot: AiPlanFormSnapshot = {
    eventType,
    city,
    district,
    guestCount,
    budgetMin,
    budgetMax,
    preferredCategories: selectedCats,
  };

  const recommendations = plan?.recommendations?.length
    ? plan.recommendations
    : fallbackRecs;

  function buildPayload() {
    return {
      eventType,
      city,
      district,
      guestCount: Number(guestCount) || 0,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      preferredCategories: selectedCats,
    };
  }

  async function runPlan() {
    setLoading(true);
    setError(null);
    setPlan(null);
    setFallbackRecs([]);
    setPartialMode(false);
    const payload = buildPayload();

    try {
      const result = await fetchAiEventPlan(payload);
      setPlan(result);

      if (!result.recommendations?.length) {
        try {
          const { recommendations: recs } = await fetchAiRecommendations(payload);
          if (recs.length > 0) {
            setPlan({ ...result, recommendations: recs });
          }
        } catch {
          /* recommendations optional supplement */
        }
      }
    } catch (err) {
      if (err instanceof ApiError) console.log("AI event-plan failed", err.body);
      try {
        const { recommendations: recs } = await fetchAiRecommendations(payload);
        setFallbackRecs(recs);
        setPartialMode(true);
      } catch (err2) {
        if (err2 instanceof ApiError) console.log("AI recommendations failed", err2.body);
        setError(
          formatApiErrorMessage(
            err2,
            "AI planı alınamadı. API bağlantısını kontrol edin.",
          ),
        );
      }
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasSearched(true);
    await runPlan();
  }

  function openOfferModal(rec: AiRecommendationItem) {
    setOfferItem(recommendationToMarketplaceItem(rec));
    setOfferOpen(true);
  }

  const catNames =
    categories.length > 0
      ? categories.map((c) => c.name!).filter(Boolean)
      : [
          "Mekan",
          "Fotoğrafçı",
          "Catering",
          "Müzik",
          "Dekorasyon",
          "Organizasyon Planlayıcı",
        ];

  return (
    <DemoShell
      title="AI Planlayıcı"
      subtitle="Etkinlik planı, bütçe dağılımı ve hizmet önerileri."
    >
      <form
        onSubmit={handleSubmit}
        className={`${glassCard} mb-8 grid gap-4 sm:grid-cols-2`}
      >
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">Etkinlik türü</span>
          <input
            className={inputClass}
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
          <input
            className={inputClass}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
          <input
            className={inputClass}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Misafir</span>
          <input
            type="number"
            className={inputClass}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe</span>
          <input
            type="number"
            className={inputClass}
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe</span>
          <input
            type="number"
            className={inputClass}
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <span className="mb-2 block text-xs text-zinc-400">Tercih edilen kategoriler</span>
          <div className="flex flex-wrap gap-2">
            {catNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => toggleCategory(name)}
                className={
                  selectedCats.includes(name)
                    ? "rounded-full bg-violet-500/30 px-3 py-1 text-xs font-medium text-white ring-1 ring-violet-400/30"
                    : "rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-violet-400/30 hover:text-zinc-200"
                }
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Plan oluşturuluyor…" : "Plan Oluştur"}
          </button>
        </div>
      </form>

      <div ref={resultsRef}>
        <AiPlannerResults
          form={formSnapshot}
          plan={plan}
          recommendations={recommendations}
          loading={loading}
          hasSearched={hasSearched}
          error={error}
          partialMode={partialMode}
          onRetry={runPlan}
          onRequestOffer={openOfferModal}
        />
      </div>

      <OfferRequestModal
        item={offerItem}
        open={offerOpen}
        onClose={() => {
          setOfferOpen(false);
          setOfferItem(null);
        }}
        onSuccess={(msg) => toast.success(msg || OFFER_REQUEST_SUCCESS_MESSAGE)}
      />
    </DemoShell>
  );
}
