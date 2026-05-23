"use client";

import type { AiSimilarEventsResult } from "@/src/lib/api/types";
import {
  AiIdeaCard,
  AiIntelligenceEmpty,
} from "@/src/components/ai-planner/AiIntelligenceStates";
import { formatTry } from "@/src/lib/aiIntelligenceUi";
import { glassCard } from "@/src/lib/ui";

type AiSimilarEventsPanelProps = {
  data: AiSimilarEventsResult | null;
  hasSearched: boolean;
};

export function AiSimilarEventsPanel({
  data,
  hasSearched,
}: AiSimilarEventsPanelProps) {
  if (!hasSearched) {
    return (
      <AiIntelligenceEmpty
        title="Benzer etkinlik analizi burada görünecek"
        description="Benzer organizasyonlardan içgörü almak için analiz edin."
      />
    );
  }

  if (!data) return null;

  const hasContent =
    data.averageBudget != null ||
    (data.popularCategories?.length ?? 0) > 0 ||
    (data.commonChecklist?.length ?? 0) > 0 ||
    (data.insights?.length ?? 0) > 0;

  if (!hasContent) {
    return (
      <AiIntelligenceEmpty
        title="Benzer etkinlik verisi bulunamadı"
        description="Daha spesifik bir etkinlik tanımı deneyin."
      />
    );
  }

  return (
    <div className="space-y-6">
      {data.averageBudget != null ? (
        <div
          className={`${glassCard} border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-violet-500/5 text-center`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300/80">
            Benzer etkinliklerde ortalama bütçe
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatTry(data.averageBudget)}
          </p>
        </div>
      ) : null}

      {data.popularCategories?.length ? (
        <div className={`${glassCard} border-violet-400/15`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Popüler kategoriler
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.popularCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <AiIdeaCard
        title="Yaygın checklist maddeleri"
        items={data.commonChecklist}
        icon="☑"
      />

      <AiIdeaCard title="İçgörüler" items={data.insights} icon="✦" />
    </div>
  );
}
