"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  fetchAiEventPlan,
  fetchAiRecommendations,
  fetchCategories,
} from "@/src/lib/api";
import type {
  AiEventPlanResult,
  AiRecommendationItem,
  Category,
} from "@/src/lib/api/types";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import { btnPrimary, glassCard, inputClass, skeletonClass } from "@/src/lib/ui";

function RecommendationCard({ rec }: { rec: AiRecommendationItem }) {
  const reasons = Array.isArray(rec.reasons)
    ? rec.reasons
    : rec.reasons
      ? [rec.reasons]
      : [];
  return (
    <article className={`${glassCard} border-emerald-500/15`}>
      <h3 className="text-lg font-semibold text-white">
        {rec.serviceTitle ?? "Hizmet"}
      </h3>
      <p className="text-sm text-violet-100/90">{rec.vendorName ?? "İşletme"}</p>
      {rec.estimatedPrice != null && (
        <p className="mt-2 text-sm text-zinc-300">
          Tahmini: {rec.estimatedPrice.toLocaleString("tr-TR")} ₺
        </p>
      )}
      {reasons.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-xs text-zinc-400">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function AiPlannerView() {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  function toggleCategory(name: string) {
    setSelectedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  const recommendations = plan?.recommendations?.length
    ? plan.recommendations
    : fallbackRecs;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setFallbackRecs([]);
    const payload = {
      eventType,
      city,
      district,
      guestCount: Number(guestCount) || 0,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      preferredCategories: selectedCats,
    };
    try {
      const result = await fetchAiEventPlan(payload);
      setPlan(result);
    } catch (err) {
      if (err instanceof ApiError) console.log("AI event-plan failed", err.body);
      try {
        const { recommendations } = await fetchAiRecommendations(payload);
        setFallbackRecs(recommendations);
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
    }
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
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
          <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Misafir</span>
          <input type="number" className={inputClass} value={guestCount} onChange={(e) => setGuestCount(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe</span>
          <input type="number" className={inputClass} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe</span>
          <input type="number" className={inputClass} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
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
                    ? "rounded-full bg-violet-500/30 px-3 py-1 text-xs font-medium text-white"
                    : "rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-400"
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

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? <div className={`${skeletonClass} mb-6 h-32`} /> : null}

      {!loading && plan?.summary ? (
        <div className={`${glassCard} mb-6`}>
          <h2 className="text-lg font-semibold text-white">Özet</h2>
          <p className="mt-2 text-sm text-zinc-300">{plan.summary}</p>
        </div>
      ) : null}

      {!loading && (plan?.budgetBreakdown?.length ?? 0) > 0 ? (
        <div className={`${glassCard} mb-6`}>
          <h2 className="text-lg font-semibold text-white">Bütçe dağılımı</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {plan!.budgetBreakdown!.map((line, i) => (
              <li key={i} className="flex justify-between text-zinc-300">
                <span>{line.category}</span>
                <span>
                  {line.amount?.toLocaleString("tr-TR")} ₺
                  {line.percentage != null ? ` (${line.percentage}%)` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && (plan?.timeline?.length ?? 0) > 0 ? (
        <div className={`${glassCard} mb-6`}>
          <h2 className="text-lg font-semibold text-white">Zaman çizelgesi</h2>
          <ol className="mt-3 space-y-3">
            {plan!.timeline!.map((step, i) => (
              <li key={i} className="border-l-2 border-violet-500/40 pl-4">
                <p className="font-medium text-white">{step.title}</p>
                <p className="text-xs text-violet-200">{step.timing}</p>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {!loading && (plan?.conceptIdeas?.length ?? 0) > 0 ? (
        <div className={`${glassCard} mb-6`}>
          <h2 className="text-lg font-semibold text-white">Konsept fikirleri</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
            {plan!.conceptIdeas!.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!loading && recommendations.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Önerilen hizmetler</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      ) : null}
    </DemoShell>
  );
}
