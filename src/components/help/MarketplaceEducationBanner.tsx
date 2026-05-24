import { MARKETPLACE_EDUCATION } from "@/src/lib/helpContent";
import { glassCard } from "@/src/lib/ui";

export function MarketplaceEducationBanner() {
  return (
    <div
      className={`${glassCard} mb-6 flex items-start gap-3 border-violet-400/20 bg-violet-500/[0.06] !py-4`}
      role="note"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/15 text-sm"
        aria-hidden
      >
        ℹ️
      </span>
      <p className="text-sm leading-relaxed text-zinc-300">{MARKETPLACE_EDUCATION}</p>
    </div>
  );
}
