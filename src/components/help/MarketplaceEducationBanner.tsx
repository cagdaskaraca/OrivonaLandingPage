import { Info } from "lucide-react";
import { MARKETPLACE_EDUCATION } from "@/src/lib/helpContent";
import { glassCard } from "@/src/lib/ui";

export function MarketplaceEducationBanner() {
  return (
    <div
      className={`${glassCard} group mb-6 flex items-center gap-3.5 border-violet-400/20 bg-violet-500/[0.06] !px-4 !py-3.5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-violet-400/35 hover:shadow-[0_0_32px_-10px_rgba(139,92,246,0.5)] sm:gap-4 sm:!py-4`}
      role="note"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-200 shadow-[0_0_18px_-6px_rgba(139,92,246,0.55)] transition-[transform,box-shadow,border-color] duration-300 ease-out group-hover:scale-[1.04] group-hover:border-violet-300/45 group-hover:shadow-[0_0_26px_-4px_rgba(167,139,250,0.6)] sm:h-10 sm:w-10"
        aria-hidden
      >
        <Info className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" strokeWidth={2} />
      </span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-300">
        {MARKETPLACE_EDUCATION}
      </p>
    </div>
  );
}
