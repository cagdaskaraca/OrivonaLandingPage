"use client";

import type { AiBudgetOptimizerResult } from "@/src/lib/api/types";
import {
  AiIntelligenceEmpty,
  AiIdeaCard,
} from "@/src/components/ai-planner/AiIntelligenceStates";
import { formatTry } from "@/src/lib/aiIntelligenceUi";
import { glassCard } from "@/src/lib/ui";

type AiBudgetOptimizerPanelProps = {
  data: AiBudgetOptimizerResult | null;
  hasSearched: boolean;
};

export function AiBudgetOptimizerPanel({
  data,
  hasSearched,
}: AiBudgetOptimizerPanelProps) {
  if (!hasSearched) {
    return (
      <AiIntelligenceEmpty
        title="Bütçe analizi burada görünecek"
        description="Bütçe ve etkinlik detaylarınızı yazıp optimize edin."
      />
    );
  }

  if (!data) return null;

  const over =
    data.overBudget === true ||
    Boolean(data.budgetWarning?.trim()) ||
    (data.currentTotal != null &&
      data.budget != null &&
      data.currentTotal > data.budget);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Mevcut toplam
          </p>
          <p className="mt-2 text-xl font-bold text-white">
            {formatTry(data.currentTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Hedef bütçe
          </p>
          <p className="mt-2 text-xl font-bold text-violet-100">
            {formatTry(data.budget)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Tahmini tasarruf
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-200">
            {formatTry(data.estimatedSavings)}
          </p>
        </div>
      </div>

      {over ? (
        <div
          className={`${glassCard} border-amber-400/30 bg-amber-500/10`}
          role="alert"
        >
          <p className="text-sm font-semibold text-amber-100">
            Bütçe aşımı uyarısı
          </p>
          <p className="mt-2 text-sm text-amber-100/85">
            {data.budgetWarning?.trim() ??
              "Tahmini toplam bütçenizin üzerinde. Aşağıdaki önerilerle dengeleyebilirsiniz."}
          </p>
        </div>
      ) : (
        <div className={`${glassCard} border-emerald-400/25 bg-emerald-500/[0.06]`}>
          <p className="text-sm text-emerald-100/90">
            Bütçeniz tahmini planla uyumlu görünüyor.
          </p>
        </div>
      )}

      <AiIdeaCard
        title="Tasarruf önerileri"
        items={data.savingSuggestions}
        icon="↓"
      />
    </div>
  );
}
