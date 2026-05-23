"use client";

import Link from "next/link";
import type {
  AiRecommendationItem,
  AiStyleMatchResult,
} from "@/src/lib/api/types";
import { AiIntelligenceEmpty } from "@/src/components/ai-planner/AiIntelligenceStates";
import { recommendationServiceId } from "@/src/lib/aiPlanner";
import { btnPrimary, btnSecondary, cardHover, glassCard } from "@/src/lib/ui";

type AiStyleMatchPanelProps = {
  data: AiStyleMatchResult | null;
  hasSearched: boolean;
  canOffer: boolean;
  onRequestOffer: (rec: AiRecommendationItem) => void;
};

function StyleMatchCard({
  rec,
  globalScore,
  canOffer,
  onRequestOffer,
}: {
  rec: AiRecommendationItem;
  globalScore?: number;
  canOffer: boolean;
  onRequestOffer: () => void;
}) {
  const serviceId = recommendationServiceId(rec);
  const detailHref =
    serviceId != null
      ? `/services/${encodeURIComponent(String(serviceId))}`
      : null;
  const score = rec.score ?? globalScore;
  const price = rec.price ?? rec.estimatedPrice ?? rec.basePrice;

  return (
    <article
      className={`${glassCard} ${cardHover} flex flex-col border-violet-400/15`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">
            {rec.serviceTitle ?? rec.title ?? "Hizmet"}
          </h3>
          <p className="mt-0.5 text-sm text-violet-200/90">
            {rec.vendorName ?? "İşletme"}
          </p>
          {(rec.city || rec.categoryName) && (
            <p className="mt-1 text-xs text-zinc-500">
              {[rec.categoryName, rec.city, rec.district]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        {score != null ? (
          <span className="shrink-0 rounded-full border border-violet-400/35 bg-violet-500/20 px-2.5 py-1 text-xs font-bold text-violet-100">
            {Math.round(score <= 1 ? score * 100 : score)}%
          </span>
        ) : null}
      </div>
      {price != null ? (
        <p className="mt-3 text-sm text-zinc-300">
          <span className="font-semibold text-white">
            {price.toLocaleString("tr-TR")} ₺
          </span>
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {detailHref ? (
          <Link href={detailHref} className={`${btnSecondary} !px-4 !py-2 text-xs`}>
            Detayları gör
          </Link>
        ) : null}
        {canOffer && serviceId != null ? (
          <button
            type="button"
            className={`${btnPrimary} !px-4 !py-2 text-xs`}
            onClick={onRequestOffer}
          >
            Teklif İste
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AiStyleMatchPanel({
  data,
  hasSearched,
  canOffer,
  onRequestOffer,
}: AiStyleMatchPanelProps) {
  if (!hasSearched) {
    return (
      <AiIntelligenceEmpty
        title="Stil eşleşmeleri burada görünecek"
        description="Etkinlik tarzınızı yazıp uygun hizmetleri bulun."
      />
    );
  }

  if (!data) return null;

  const services = data.matchedServices ?? [];

  if (!data.explanation?.trim() && services.length === 0) {
    return (
      <AiIntelligenceEmpty
        title="Stil eşleşmesi bulunamadı"
        description="Farklı bir stil veya konum deneyin."
      />
    );
  }

  return (
    <div className="space-y-6">
      {(data.styleScore != null || data.explanation?.trim()) && (
        <div
          className={`${glassCard} border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5`}
        >
          {data.styleScore != null ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
              Genel stil skoru:{" "}
              <span className="text-lg text-white">
                {Math.round(
                  data.styleScore <= 1
                    ? data.styleScore * 100
                    : data.styleScore,
                )}
                %
              </span>
            </p>
          ) : null}
          {data.explanation?.trim() ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {data.explanation}
            </p>
          ) : null}
        </div>
      )}

      {services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((rec, i) => (
            <StyleMatchCard
              key={String(recommendationServiceId(rec) ?? i)}
              rec={rec}
              globalScore={data.styleScore}
              canOffer={canOffer}
              onRequestOffer={() => onRequestOffer(rec)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
