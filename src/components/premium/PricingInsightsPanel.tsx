"use client";

import { useState } from "react";
import {
  fetchAiPricingInsights,
  type PricingInsights,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { pricingPositionLabel } from "@/src/lib/premiumLabels";
import { btnPrimary, glassCard } from "@/src/lib/ui";

type PricingInsightsPanelProps = {
  serviceId?: string | number;
  categoryId?: string | number;
  city?: string;
  basePrice?: number;
};

function formatTry(n?: number) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PricingInsightsPanel({
  serviceId,
  categoryId,
  city,
  basePrice,
}: PricingInsightsPanelProps) {
  const [insights, setInsights] = useState<PricingInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInsights() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAiPricingInsights({
        serviceId,
        categoryId,
        city,
        basePrice,
      });
      if (!result) {
        setUnavailable(true);
        return;
      }
      setInsights(result);
    } catch (err) {
      logApiError("Pricing insights", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Fiyat analizi alınamadı."));
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) {
    return (
      <p className="text-sm text-zinc-500">AI fiyat analizi hazırlanıyor.</p>
    );
  }

  return (
    <div className={glassCard}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-violet-200">AI Fiyat Analizi</h3>
        <button
          type="button"
          className={`${btnPrimary} !px-4 !py-2 text-xs`}
          disabled={loading}
          onClick={() => void loadInsights()}
        >
          {loading ? "Analiz ediliyor…" : "AI fiyat önerisi al"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-300/90">{error}</p>
      ) : null}

      {insights ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Piyasa ortalaması</dt>
            <dd className="text-lg font-semibold text-white">
              {formatTry(insights.marketAverage)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Önerilen aralık</dt>
            <dd className="text-lg font-semibold text-white">
              {formatTry(insights.suggestedPriceMin)} –{" "}
              {formatTry(insights.suggestedPriceMax)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Konum</dt>
            <dd className="text-sm font-medium text-violet-200">
              {pricingPositionLabel(insights.position)}
            </dd>
          </div>
          {insights.percentageDifference != null ? (
            <div>
              <dt className="text-xs text-zinc-500">Fark</dt>
              <dd className="text-sm text-white">
                %{insights.percentageDifference.toFixed(1)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {insights?.tips && insights.tips.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {insights.tips.map((tip, i) => (
            <li key={i} className="text-sm text-zinc-400">
              • {tip}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
