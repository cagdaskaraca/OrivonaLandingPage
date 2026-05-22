import type { DashboardSummary } from "@/src/lib/api/types";
import { summaryEntries } from "@/src/lib/dashboardLabels";
import { glassCard, skeletonClass } from "@/src/lib/ui";

type SummaryCardsProps = {
  summary: DashboardSummary | null | undefined;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function SummaryCards({
  summary,
  loading,
  emptyMessage = "Özet verisi yok.",
  className = "mb-8",
}: SummaryCardsProps) {
  if (loading) {
    return <div className={`${skeletonClass} ${className} h-24`} />;
  }

  const entries = summaryEntries(summary);
  if (entries.length === 0) {
    if (!emptyMessage) return null;
    return (
      <p className={`text-sm text-zinc-500 ${className}`}>{emptyMessage}</p>
    );
  }

  return (
    <dl className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {entries.map(({ key, label, displayValue }) => (
        <div
          key={key}
          className={`${glassCard} py-4`}
        >
          <dt className="text-xs font-medium text-zinc-400">{label}</dt>
          <dd className="mt-1.5 text-xl font-semibold tracking-tight text-white">
            {displayValue}
          </dd>
        </div>
      ))}
    </dl>
  );
}
