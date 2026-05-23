import type { AiTimelineStep } from "@/src/lib/api/types";
import { formatMonthOffset } from "@/src/lib/aiPlanner";

type AiPlanningTimelineProps = {
  steps: AiTimelineStep[];
};

export function AiPlanningTimeline({ steps }: AiPlanningTimelineProps) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const offsetLabel =
          step.monthOffset != null
            ? formatMonthOffset(step.monthOffset)
            : step.timing?.trim();
        return (
          <li
            key={`${step.title}-${i}`}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {i < steps.length - 1 ? (
              <span
                className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-gradient-to-b from-violet-400/50 to-transparent"
                aria-hidden
              />
            ) : null}
            <span
              className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/20 text-[10px] font-bold text-violet-100"
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{step.title ?? "Adım"}</p>
                {offsetLabel ? (
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                    {offsetLabel}
                  </span>
                ) : null}
              </div>
              {step.description ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
