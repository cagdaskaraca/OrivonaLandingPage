"use client";

import Link from "next/link";
import { AiBudgetBreakdown } from "@/src/components/ai-planner/AiBudgetBreakdown";
import { AiBudgetTotal } from "@/src/components/ai-planner/AiBudgetTotal";
import { AiConceptSuggestions } from "@/src/components/ai-planner/AiConceptSuggestions";
import { AiDetectedSummary } from "@/src/components/ai-planner/AiDetectedSummary";
import { AiPlannerSection } from "@/src/components/ai-planner/AiPlannerSection";
import { AiPlanChecklist } from "@/src/components/ai-planner/AiPlanChecklist";
import { AiPlanningTimeline } from "@/src/components/ai-planner/AiPlanningTimeline";
import { AiPlanTips } from "@/src/components/ai-planner/AiPlanTips";
import { AiRecommendedServices } from "@/src/components/ai-planner/AiRecommendedServices";
import type {
  AiEventPlanResult,
  AiRecommendationItem,
} from "@/src/lib/api/types";
import {
  buildPlanMarketplaceHref,
  planHasAnyContent,
  planHasBudget,
  planHasChecklist,
  planHasConcepts,
  planHasDetected,
  planHasTips,
  planHasTimeline,
  recommendationServiceId,
} from "@/src/lib/aiPlanner";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

type AiPlannerResultsProps = {
  plan: AiEventPlanResult | null;
  recommendations: AiRecommendationItem[];
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
  canOffer: boolean;
  canMessage: boolean;
  onRetry: () => void;
  onRequestOffer: (rec: AiRecommendationItem) => void;
  onMessageSend: (rec: AiRecommendationItem) => void;
};

export function AiPlannerResults({
  plan,
  recommendations,
  loading,
  hasSearched,
  error,
  canOffer,
  canMessage,
  onRetry,
  onRequestOffer,
  onMessageSend,
}: AiPlannerResultsProps) {
  const marketplaceHref = buildPlanMarketplaceHref(plan);
  const hasContent = planHasAnyContent(plan, recommendations);

  if (!hasSearched && !loading) {
    return (
      <div
        className={`${glassCard} border-dashed border-violet-400/20 text-center`}
      >
        <p className="text-base font-medium text-white">Planınız burada görünecek</p>
        <p className="mt-2 text-sm text-zinc-500">
          Etkinliğinizi doğal dille anlatın; AI bütçe, zaman çizelgesi, checklist ve
          hizmet önerileri üretsin.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Plan yükleniyor">
        <div className={`${glassCard} animate-pulse border-violet-400/20`}>
          <p className="text-sm font-medium text-violet-200">
            ORIVONA Intelligence analiz ediyor...
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Bütçe dağılımı, zaman çizelgesi ve hizmet önerileri oluşturuluyor.
          </p>
        </div>
        <AiPlannerSection title="Anlaşılan etkinlik" loading />
        <AiPlannerSection title="Bütçe dağılımı" loading />
        <AiPlannerSection title="Planlama zaman çizelgesi" loading />
        <AiPlannerSection title="Organizasyon checklist'i" loading />
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
          İsteğinizi biraz daha ayrıntılı yazmayı deneyin; şehir, kişi sayısı ve
          bütçe eklemek sonuçları iyileştirir.
        </p>
        <button type="button" className={`${btnSecondary} mt-4`} onClick={onRetry}>
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {plan?.summary?.trim() ? (
        <div className={`${glassCard} mb-6 border-violet-400/15`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">
            AI özeti
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{plan.summary}</p>
        </div>
      ) : null}

      <AiPlannerSection
        title="Anlaşılan etkinlik"
        subtitle="İsteğinizden çıkarılan bilgiler"
        empty={!planHasDetected(plan)}
        emptyMessage="Etkinlik detayları bu planda yer almıyor."
      >
        {plan ? <AiDetectedSummary plan={plan} /> : null}
      </AiPlannerSection>

      <AiPlannerSection
        title="Bütçe dağılımı"
        subtitle="Kategorilere göre tahmini paylar"
        empty={!planHasBudget(plan)}
        emptyMessage="Bütçe dağılımı bu planda yer almıyor."
      >
        {plan?.budgetBreakdown ? (
          <>
            <AiBudgetBreakdown lines={plan.budgetBreakdown} />
            <AiBudgetTotal plan={plan} />
          </>
        ) : plan ? (
          <AiBudgetTotal plan={plan} />
        ) : null}
      </AiPlannerSection>

      <AiPlannerSection
        title="Planlama zaman çizelgesi"
        subtitle="Etkinliğe kadar önerilen adımlar"
        empty={!planHasTimeline(plan)}
        emptyMessage="Zaman çizelgesi bu planda yer almıyor."
      >
        {plan?.timeline ? <AiPlanningTimeline steps={plan.timeline} /> : null}
      </AiPlannerSection>

      <AiPlannerSection
        title="Organizasyon checklist'i"
        subtitle="Öncelikli yapılacaklar"
        empty={!planHasChecklist(plan)}
        emptyMessage="Checklist bu planda yer almıyor."
      >
        {plan?.checklist ? <AiPlanChecklist items={plan.checklist} /> : null}
      </AiPlannerSection>

      {planHasConcepts(plan) ? (
        <AiPlannerSection
          title="Konsept önerileri"
          subtitle="Tema ve atmosfer fikirleri"
        >
          <AiConceptSuggestions ideas={plan!.conceptIdeas!} />
        </AiPlannerSection>
      ) : null}

      <AiPlannerSection
        title="AI ipuçları"
        subtitle="Tasarruf ve planlama önerileri"
        empty={!planHasTips(plan)}
        emptyMessage="Bu planda ek ipucu yok."
      >
        {plan?.aiTips ? <AiPlanTips tips={plan.aiTips} /> : null}
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
          canOffer={canOffer}
          canMessage={canMessage}
          onRequestOffer={onRequestOffer}
          onMessageSend={onMessageSend}
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
            Marketplace&apos;te ara
          </Link>
          {recommendations.length > 0 &&
          recommendations.some((r) => recommendationServiceId(r) != null) &&
          canOffer ? (
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
