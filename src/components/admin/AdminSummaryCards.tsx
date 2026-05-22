import type { DashboardSummary } from "@/src/lib/api/types";
import {
  ADMIN_SUMMARY_METRICS,
  formatAdminSummaryValue,
  pickSummaryValue,
} from "@/src/lib/adminDashboard";
import { glassCard, skeletonClass } from "@/src/lib/ui";

type AdminSummaryCardsProps = {
  summary: DashboardSummary | null | undefined;
  loading?: boolean;
  className?: string;
};

export function AdminSummaryCards({
  summary,
  loading,
  className = "mb-8",
}: AdminSummaryCardsProps) {
  if (loading) {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {ADMIN_SUMMARY_METRICS.map((m) => (
          <div key={m.label} className={`${skeletonClass} h-24`} />
        ))}
      </div>
    );
  }

  return (
    <dl className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {ADMIN_SUMMARY_METRICS.map(({ keys, label }) => {
        const value = pickSummaryValue(summary, keys);
        return (
          <div key={label} className={`${glassCard} py-4`}>
            <dt className="text-xs font-medium text-zinc-400">{label}</dt>
            <dd className="mt-1.5 text-xl font-semibold tracking-tight text-white">
              {formatAdminSummaryValue(keys, value)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
