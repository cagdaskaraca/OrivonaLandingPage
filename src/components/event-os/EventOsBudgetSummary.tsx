"use client";

import { formatTurkishLira } from "@/src/lib/customerAgreementsUi";
import type { EventPlanBudgetSummary } from "@/src/lib/api/types";
import { glassCard } from "@/src/lib/ui";

type EventOsBudgetSummaryProps = {
  summary: EventPlanBudgetSummary | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
};

function lineLabel(line: NonNullable<EventPlanBudgetSummary["lines"]>[number]): string {
  return (
    line.label?.trim() ||
    line.companyName?.trim() ||
    line.categoryName?.trim() ||
    "Kalem"
  );
}

export function EventOsBudgetSummary({
  summary,
  loading,
  error,
  onRetry,
}: EventOsBudgetSummaryProps) {
  if (loading) {
    return (
      <p className="text-sm text-zinc-500">Bütçe özeti yükleniyor…</p>
    );
  }

  if (error) {
    return (
      <div className={`${glassCard} border-amber-500/20 bg-amber-500/5 p-4`}>
        <p className="text-sm text-amber-100">{error}</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs font-medium text-violet-300 hover:text-violet-200"
            onClick={onRetry}
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    );
  }

  const lines = summary?.lines ?? [];
  const totalSpent = summary?.totalSpent ?? 0;
  const remaining = summary?.remainingBudget;
  const totalBudget = summary?.totalBudget;

  if (lines.length === 0 && totalSpent === 0 && totalBudget == null) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-zinc-500">
        Henüz anlaşılan firma yok. Checklist maddelerinden anlaşma ekleyin; harcamalar burada görünür.
      </p>
    );
  }

  return (
    <div className={`${glassCard} space-y-3 p-4`}>
      <h3 className="text-sm font-semibold text-white">Tahmini bütçe özeti</h3>
      {lines.length > 0 ? (
        <ul className="space-y-2 border-b border-white/10 pb-3">
          {lines.map((line, index) => (
            <li
              key={String(line.agreementId ?? line.taskId ?? index)}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-zinc-300">{lineLabel(line)}</span>
              <span className="shrink-0 font-medium text-violet-100">
                {formatTurkishLira(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-400">Toplam Harcanan</dt>
          <dd className="font-semibold text-emerald-200">
            {formatTurkishLira(totalSpent)}
          </dd>
        </div>
        {remaining != null ? (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Kalan Bütçe</dt>
            <dd className="font-semibold text-white">
              {formatTurkishLira(remaining)}
            </dd>
          </div>
        ) : null}
        {totalBudget != null ? (
          <div className="flex justify-between gap-3 text-xs">
            <dt className="text-zinc-500">Plan bütçe üst limiti</dt>
            <dd className="text-zinc-400">{formatTurkishLira(totalBudget)}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
