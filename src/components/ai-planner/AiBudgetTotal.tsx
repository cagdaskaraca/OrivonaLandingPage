import type { AiEventPlanResult } from "@/src/lib/api/types";
import { formatTry } from "@/src/lib/aiPlanner";

type AiBudgetTotalProps = {
  plan: AiEventPlanResult;
};

export function AiBudgetTotal({ plan }: AiBudgetTotalProps) {
  const hasRange =
    plan.totalEstimatedMin != null || plan.totalEstimatedMax != null;
  const hasMeta =
    hasRange || plan.budgetStatus?.trim() || plan.budgetWarning?.trim();

  if (!hasMeta) return null;

  return (
    <div className="mt-6 rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] to-fuchsia-500/[0.05] px-4 py-4">
      {hasRange ? (
        <p className="text-sm text-zinc-300">
          Toplam tahmini bütçe:{" "}
          <span className="font-semibold text-white">
            {plan.totalEstimatedMin != null && plan.totalEstimatedMax != null
              ? `${formatTry(plan.totalEstimatedMin)} – ${formatTry(plan.totalEstimatedMax)}`
              : formatTry(plan.totalEstimatedMin ?? plan.totalEstimatedMax)}
          </span>
        </p>
      ) : null}
      {plan.budgetStatus?.trim() ? (
        <p className="mt-2 text-sm font-medium text-violet-100/95">
          {plan.budgetStatus}
        </p>
      ) : null}
      {plan.budgetWarning?.trim() ? (
        <p className="mt-2 text-sm text-amber-200/90">{plan.budgetWarning}</p>
      ) : null}
    </div>
  );
}
