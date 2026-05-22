"use client";

import Link from "next/link";
import { AiBudgetBreakdown } from "@/src/components/ai-planner/AiBudgetBreakdown";
import { AiConceptSuggestions } from "@/src/components/ai-planner/AiConceptSuggestions";
import { AiPlannerSection } from "@/src/components/ai-planner/AiPlannerSection";
import { AiPlanningTimeline } from "@/src/components/ai-planner/AiPlanningTimeline";
import { AiRecommendedServices } from "@/src/components/ai-planner/AiRecommendedServices";
import type {
  AiEventPlanResult,
  AiRecommendationItem,
} from "@/src/lib/api/types";
import {
  buildPlanMarketplaceHref,
  planHasAnyContent,
  planHasBudget,
  planHasConcepts,
  planHasTimeline,
  recommendationServiceId,
  type AiPlanFormSnapshot,
} from "@/src/lib/aiPlanner";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

type AiPlannerResultsProps = {
  form: AiPlanFormSnapshot;
  plan: AiEventPlanResult | null;
  recommendations: AiRecommendationItem[];
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
  partialMode: boolean;
  onRetry: () => void;
  onRequestOffer: (rec: AiRecommendationItem) => void;
};

export function AiPlannerResults({
  form,
  plan,
  recommendations,
  loading,
  hasSearched,
  error,
  partialMode,
  onRetry,
  onRequestOffer,
}: AiPlannerResultsProps) {
  const marketplaceHref = buildPlanMarketplaceHref(form);
  const hasContent = planHasAnyContent(plan, recommendations);

  if (!hasSearched && !loading) {
    return (
      <div
        className={`${glassCard} border-dashed border-violet-400/20 text-center`}
      >
        <p className="text-base font-medium text-white">Planınız burada görünecek</p>
        <p className="mt-2 text-sm text-zinc-500">
          Formu doldurup Plan Oluştur&apos;a basın; AI bütçe, zaman çizelgesi ve hizmet
          önerileri üretir.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Plan yükleniyor">
        <div className={`${glassCard} animate-pulse border-violet-400/20`}>
          <p className="text-sm font-medium text-violet-200">AI planınız hazırlanıyor…</p>
          <p className="mt-1 text-xs text-zinc-500">
            Bütçe dağılımı, zaman çizelgesi ve hizmet önerileri oluşturuluyor.
          </p>
        </div>
        <AiPlannerSection title="AI bütçe dağılımı" loading />
        <AiPlannerSection title="Planlama zaman çizelgesi" loading />
        <AiPlannerSection title="Konsept önerileri" loading />
        <AiPlannerSection title="Önerilen hizmetler" loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-200"
        >
          <p className="font-medium text-red-100">Plan oluşturulamadı</p>
          <p className="mt-2 whitespace-pre-line">{error}</p>
        </div>
        <button type="button" className={btnSecondary} onClick={onRetry}>
          Tekrar dene
        </button>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className={`${glassCard} text-center`}>
        <p className="text-base font-medium text-white">Sonuç bulunamadı</p>
        <p className="mt-2 text-sm text-zinc-500">
          Bu kriterlerle plan üretilemedi. Bütçe aralığını genişletmeyi veya farklı
          kategoriler seçmeyi deneyin.
        </p>
        <button type="button" className={`${btnSecondary} mt-4`} onClick={onRetry}>
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {partialMode ? (
        <div className="mb-6 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Tam etkinlik planı şu an alınamadı; yalnızca hizmet önerileri gösteriliyor.
        </div>
      ) : null}

      {plan?.summary?.trim() ? (
        <div className={`${glassCard} mb-6 border-violet-400/15`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">
            AI özeti
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{plan.summary}</p>
        </div>
      ) : null}

      <AiPlannerSection
        title="AI bütçe dağılımı"
        subtitle="Kategorilere göre tahmini bütçe payları"
        empty={!planHasBudget(plan)}
        emptyMessage="Bütçe dağılımı bu planda yer almıyor."
      >
        <AiBudgetBreakdown lines={plan!.budgetBreakdown!} />
      </AiPlannerSection>

      <AiPlannerSection
        title="Planlama zaman çizelgesi"
        subtitle="Etkinliğe kadar önerilen adımlar"
        empty={!planHasTimeline(plan)}
        emptyMessage="Zaman çizelgesi bu planda yer almıyor."
      >
        <AiPlanningTimeline steps={plan!.timeline!} />
      </AiPlannerSection>

      <AiPlannerSection
        title="Konsept önerileri"
        subtitle="Tema ve atmosfer fikirleri"
        empty={!planHasConcepts(plan)}
        emptyMessage="Konsept önerisi bu planda yer almıyor."
      >
        <AiConceptSuggestions ideas={plan!.conceptIdeas!} />
      </AiPlannerSection>

      <AiPlannerSection
        id="onerilen-hizmetler"
        title="Önerilen hizmetler"
        subtitle="Planınıza uygun işletmeler"
        empty={recommendations.length === 0}
        emptyMessage="Önerilen hizmet bulunamadı. Marketplace'te arama yapabilirsiniz."
      >
        <AiRecommendedServices
          recommendations={recommendations}
          onRequestOffer={onRequestOffer}
        />
      </AiPlannerSection>

      <div
        className={`${glassCard} mt-8 border-violet-400/25 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 text-center`}
      >
        <h3 className="text-lg font-semibold text-white">Plana uygun teklif alın</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Önerilen hizmetlerden teklif isteyin veya marketplace&apos;te planınıza uygun
          işletmeleri keşfedin.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href={marketplaceHref} className={btnPrimary}>
            Bu plana göre teklif iste
          </Link>
          {recommendations.length > 0 &&
          recommendations.some((r) => recommendationServiceId(r) != null) ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => onRequestOffer(recommendations[0]!)}
            >
              İlk öneriye teklif iste
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
