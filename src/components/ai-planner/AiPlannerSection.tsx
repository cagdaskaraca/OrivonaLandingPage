import type { ReactNode } from "react";
import { glassCard, skeletonClass } from "@/src/lib/ui";

type AiPlannerSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
};

export function AiPlannerSection({
  id,
  title,
  subtitle,
  loading,
  empty,
  emptyMessage = "Bu bölüm için veri bulunamadı.",
  children,
}: AiPlannerSectionProps) {
  return (
    <section id={id} className={`${glassCard} mb-6`}>
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className={`${skeletonClass} h-4 w-3/4 max-w-md`} />
          <div className={`${skeletonClass} h-4 w-full`} />
          <div className={`${skeletonClass} h-4 w-5/6`} />
          <div className={`${skeletonClass} mt-2 h-20 w-full`} />
        </div>
      ) : empty ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-zinc-500">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </section>
  );
}
