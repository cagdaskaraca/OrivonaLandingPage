import type { AiBudgetLine } from "@/src/lib/api/types";
import {
  budgetLineAmountTotal,
  budgetPercent,
  formatTry,
  resolveBudgetLineLabel,
} from "@/src/lib/aiPlanner";

const BAR_COLORS = [
  "from-violet-400 to-violet-500",
  "from-fuchsia-400 to-fuchsia-500",
  "from-purple-400 to-purple-500",
  "from-indigo-400 to-indigo-500",
  "from-violet-300 to-fuchsia-400",
  "from-purple-300 to-violet-400",
];

type AiBudgetBreakdownProps = {
  lines: AiBudgetLine[];
};

function formatLineBudget(line: AiBudgetLine): string {
  if (line.estimatedMin != null && line.estimatedMax != null) {
    return `${formatTry(line.estimatedMin)} – ${formatTry(line.estimatedMax)}`;
  }
  if (line.suggestedBudget != null) return formatTry(line.suggestedBudget);
  if (line.amount != null) return formatTry(line.amount);
  if (line.estimatedMin != null) return formatTry(line.estimatedMin);
  if (line.estimatedMax != null) return formatTry(line.estimatedMax);
  return "—";
}

export function AiBudgetBreakdown({ lines }: AiBudgetBreakdownProps) {
  const total = budgetLineAmountTotal(lines) || 1;

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const pct = budgetPercent(line, total);
        const color = BAR_COLORS[i % BAR_COLORS.length];
        const label = resolveBudgetLineLabel(line);
        return (
          <div key={`${label}-${i}`}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-zinc-200">{label}</span>
              <span className="text-zinc-400">
                {formatLineBudget(line)}
                <span className="ml-2 text-violet-200/90">%{pct}</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
              />
            </div>
            {line.suggestedBudget != null &&
            line.estimatedMin != null &&
            line.estimatedMax != null ? (
              <p className="mt-1 text-[11px] text-zinc-500">
                Önerilen: {formatTry(line.suggestedBudget)}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
