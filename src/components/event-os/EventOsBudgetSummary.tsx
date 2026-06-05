"use client";

import { OfferPriceBreakdown } from "@/src/components/offers/OfferPriceBreakdown";
import {
  formatBudgetLineLabel,
  formatTryCurrency,
} from "@/src/lib/customerAgreementsUi";
import { resolveOfferDisplayPrice } from "@/src/lib/offerPricing";
import type { EventPlanBudgetSummary } from "@/src/lib/api/types";
import { glassCard } from "@/src/lib/ui";

type EventOsBudgetSummaryProps = {
  summary: EventPlanBudgetSummary | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
};

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

  const lines = summary?.items ?? summary?.lines ?? [];
  const totalBudget = summary?.totalBudget;
  const spentFromLines =
    lines.length > 0
      ? lines.reduce((sum, line) => sum + resolveOfferDisplayPrice(line), 0)
      : undefined;
  const spent =
    spentFromLines ??
    summary?.spentBudget ??
    summary?.totalSpent ??
    0;
  const remaining =
    totalBudget != null ? Math.max(0, totalBudget - spent) : summary?.remainingBudget;

  if (
    lines.length === 0 &&
    spent === 0 &&
    totalBudget == null &&
    remaining == null
  ) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-center text-sm text-zinc-500">
        Henüz kabul edilmiş teklif yok. «Tekliflerim» bölümünden teklif kabul
        ettiğinizde harcamalar burada görünür.
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
              key={String(line.id ?? index)}
              className="flex flex-wrap items-start justify-between gap-3 text-sm"
            >
              <span className="min-w-0 text-zinc-300">
                {formatBudgetLineLabel(line)}
              </span>
              <OfferPriceBreakdown pricing={line} size="sm" className="text-right" />
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="space-y-1.5 text-sm">
        {totalBudget != null ? (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Toplam Bütçe</dt>
            <dd className="font-medium text-zinc-200">
              {formatTryCurrency(totalBudget)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-400">Toplam Harcanan</dt>
          <dd className="font-semibold text-emerald-200">
            {formatTryCurrency(spent)}
          </dd>
        </div>
        {remaining != null ? (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-400">Kalan Bütçe</dt>
            <dd className="font-semibold text-white">
              {formatTryCurrency(remaining)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
