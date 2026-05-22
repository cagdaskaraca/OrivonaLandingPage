"use client";

import { useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { fetchAiRecommendations } from "@/src/lib/api";
import type { AiRecommendationItem } from "@/src/lib/api/types";
import { ApiError } from "@/src/lib/api/client";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

function RecommendationCard({ rec }: { rec: AiRecommendationItem }) {
  const reasons = Array.isArray(rec.reasons)
    ? rec.reasons
    : rec.reasons
      ? [rec.reasons]
      : [];

  return (
    <article className={`${glassCard} border-emerald-500/15`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/90">
        AI Öneri
        {rec.score != null ? ` · Skor ${rec.score}` : ""}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">
        {rec.serviceTitle ?? "Hizmet"}
      </h3>
      <p className="mt-1 text-sm text-violet-100/90">
        {rec.vendorName ?? "İşletme"}
      </p>
      {rec.estimatedPrice != null && (
        <p className="mt-3 text-sm text-zinc-300">
          Tahmini fiyat:{" "}
          <span className="font-semibold text-white">
            {rec.estimatedPrice.toLocaleString("tr-TR")} ₺
          </span>
        </p>
      )}
      {reasons.length > 0 && (
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-zinc-400">
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
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [guestCount, setGuestCount] = useState("120");
  const [budgetMin, setBudgetMin] = useState("200000");
  const [budgetMax, setBudgetMax] = useState("400000");
  const [preferredCategories, setPreferredCategories] = useState(
    "Mekan, Catering, DJ",
  );
  const [results, setResults] = useState<AiRecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(true);
    try {
      const { response, recommendations } = await fetchAiRecommendations({
        eventType,
        city,
        district,
        guestCount: Number(guestCount) || 0,
        budgetMin: Number(budgetMin) || 0,
        budgetMax: Number(budgetMax) || 0,
        preferredCategories: preferredCategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (response.data.data) {
        console.log("Recommendations", response.data.data.recommendations);
      }
      setResults(recommendations);
    } catch (err) {
      setResults([]);
      setError(
        err instanceof ApiError
          ? err.message
          : "Öneriler alınamadı. Backend API bağlantısını kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="AI Planlayıcı"
      subtitle="Etkinlik detaylarınızı gönderin; ORIVONA Intelligence size uygun hizmet önerileri üretsin."
    >
      <form
        onSubmit={handleSubmit}
        className={`${glassCard} mb-8 grid gap-4 sm:grid-cols-2`}
      >
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Etkinlik türü
          </span>
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
          <span className="mb-1.5 block text-xs text-zinc-400">
            Misafir sayısı
          </span>
          <input
            className={inputClass}
            type="number"
            min={1}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Tercih edilen kategoriler (virgülle)
          </span>
          <input
            className={inputClass}
            value={preferredCategories}
            onChange={(e) => setPreferredCategories(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            required
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={btnPrimary} disabled={loading}>
            {loading ? "Analiz ediliyor…" : "Önerileri Al"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-zinc-400">Öneriler hazırlanıyor…</p>
      ) : null}

      {!loading && submitted && results.length === 0 && !error ? (
        <div className={`${glassCard} text-center text-sm text-zinc-400`}>
          Bu kriterlere uygun öneri dönmedi.
        </div>
      ) : null}

      {!loading && results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {results.map((rec, i) => (
            <RecommendationCard key={`${rec.vendorName}-${i}`} rec={rec} />
          ))}
        </div>
      ) : null}
    </DemoShell>
  );
}
