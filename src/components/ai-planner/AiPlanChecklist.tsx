import type { AiChecklistItem } from "@/src/lib/api/types";
import { getStatusLabel } from "@/src/lib/statusLabels";

type AiPlanChecklistProps = {
  items: AiChecklistItem[];
};

function priorityClass(priority?: string): string {
  const p = priority?.trim().toLowerCase();
  if (p === "high" || p === "yüksek" || p === "yuksek") {
    return "border-red-400/30 bg-red-500/10 text-red-200";
  }
  if (p === "low" || p === "düşük" || p === "dusuk") {
    return "border-zinc-400/25 bg-white/[0.04] text-zinc-300";
  }
  return "border-amber-400/25 bg-amber-500/10 text-amber-100";
}

export function AiPlanChecklist({ items }: AiPlanChecklistProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const label =
          item.categoryName?.trim() && item.categoryName.toLowerCase() !== "kategori"
            ? item.categoryName
            : null;
        return (
          <li
            key={`${item.title}-${i}`}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {label ? (
                <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200">
                  {label}
                </span>
              ) : null}
              {item.priority?.trim() ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityClass(item.priority)}`}
                >
                  {item.priority}
                </span>
              ) : null}
              {item.status?.trim() ? (
                <span className="text-[10px] font-medium text-zinc-400">
                  {getStatusLabel(item.status)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-medium text-white">{item.title ?? "Görev"}</p>
            {item.description?.trim() ? (
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {item.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
