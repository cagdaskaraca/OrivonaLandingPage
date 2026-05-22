"use client";

import Link from "next/link";
import type { AiRecommendationItem } from "@/src/lib/api/types";
import {
  normalizeRecommendationReasons,
  recommendationServiceId,
} from "@/src/lib/aiPlanner";
import { btnPrimary, btnSecondary, cardHover, glassCard } from "@/src/lib/ui";

type AiRecommendedServicesProps = {
  recommendations: AiRecommendationItem[];
  onRequestOffer: (rec: AiRecommendationItem) => void;
};

export function AiRecommendedServices({
  recommendations,
  onRequestOffer,
}: AiRecommendedServicesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {recommendations.map((rec, i) => {
        const reasons = normalizeRecommendationReasons(rec.reasons);
        const serviceId = recommendationServiceId(rec);
        const detailHref =
          serviceId != null
            ? `/services/${encodeURIComponent(String(serviceId))}`
            : null;

        return (
          <article
            key={`${serviceId ?? rec.serviceTitle}-${i}`}
            className={`${glassCard} ${cardHover} flex flex-col border-violet-400/15`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {rec.serviceTitle ?? "Hizmet"}
                </h3>
                <p className="mt-0.5 text-sm text-violet-200/90">
                  {rec.vendorName ?? "İşletme"}
                </p>
              </div>
              {rec.score != null ? (
                <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                  %{Math.round(rec.score <= 1 ? rec.score * 100 : rec.score)}
                </span>
              ) : null}
            </div>

            {rec.estimatedPrice != null ? (
              <p className="mt-3 text-sm text-zinc-300">
                Tahmini:{" "}
                <span className="font-semibold text-white">
                  {rec.estimatedPrice.toLocaleString("tr-TR")} ₺
                </span>
              </p>
            ) : null}

            {reasons.length > 0 ? (
              <ul className="mt-3 flex-1 space-y-1 text-xs text-zinc-400">
                {reasons.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-violet-400" aria-hidden>
                      •
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {serviceId != null ? (
                <button
                  type="button"
                  className={`${btnPrimary} !px-4 !py-2 text-xs`}
                  onClick={() => onRequestOffer(rec)}
                >
                  Teklif İste
                </button>
              ) : null}
              {detailHref ? (
                <Link href={detailHref} className={`${btnSecondary} !px-4 !py-2 text-xs`}>
                  Detay
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
