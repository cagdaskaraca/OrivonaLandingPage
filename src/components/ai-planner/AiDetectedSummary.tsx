import type { AiEventPlanResult } from "@/src/lib/api/types";
import { formatTry } from "@/src/lib/aiPlanner";

type AiDetectedSummaryProps = {
  plan: AiEventPlanResult;
};

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/80">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function AiDetectedSummary({ plan }: AiDetectedSummaryProps) {
  const budgetLabel =
    plan.budgetMin != null && plan.budgetMax != null
      ? `${formatTry(plan.budgetMin)} – ${formatTry(plan.budgetMax)}`
      : plan.budgetMin != null
        ? formatTry(plan.budgetMin)
        : plan.budgetMax != null
          ? formatTry(plan.budgetMax)
          : undefined;

  const styleTheme = [plan.style, plan.theme].filter(Boolean).join(" · ");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Etkinlik türü" value={plan.eventType} />
      <Field label="Şehir" value={plan.city} />
      <Field label="İlçe" value={plan.district} />
      <Field
        label="Misafir sayısı"
        value={plan.guestCount != null ? `${plan.guestCount} kişi` : undefined}
      />
      <Field label="Bütçe" value={budgetLabel} />
      <Field label="Stil / Tema" value={styleTheme || undefined} />
    </div>
  );
}
