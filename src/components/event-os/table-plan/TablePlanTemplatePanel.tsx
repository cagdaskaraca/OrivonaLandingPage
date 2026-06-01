"use client";

import type { TablePlanTableType } from "@/src/lib/api/types";
import { TABLE_TEMPLATES } from "@/src/lib/tablePlan/helpers";
import { cardHover, glassCard } from "@/src/lib/ui";

type TablePlanTemplatePanelProps = {
  onPick: (type: TablePlanTableType) => void;
};

function TemplateIcon({ type }: { type: TablePlanTableType }) {
  const base = "border border-violet-400/30 bg-violet-500/15";
  if (type === "Stage") {
    return <div className={`h-5 w-12 rounded ${base}`} />;
  }
  if (type === "DanceFloor" || type === "CustomArea") {
    return <div className={`h-8 w-8 rounded-md ${base}`} />;
  }
  if (type.startsWith("Round")) {
    return <div className={`h-8 w-8 rounded-full ${base}`} />;
  }
  if (type.startsWith("Rectangle")) {
    return <div className={`h-5 w-10 rounded ${base}`} />;
  }
  return <div className={`h-7 w-7 rounded-sm ${base}`} />;
}

export function TablePlanTemplatePanel({ onPick }: TablePlanTemplatePanelProps) {
  return (
    <div className={`${glassCard} !p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto orivona-scroll-y`}>
      <h3 className="mb-3 text-sm font-semibold text-white">Şablonlar</h3>
      <p className="mb-3 text-xs text-zinc-500">
        Eklemek için bir şablon seçin.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
        {TABLE_TEMPLATES.map((t) => (
          <button
            key={t.tableType}
            type="button"
            className={`${cardHover} flex min-w-[140px] shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left lg:min-w-0 lg:w-full`}
            onClick={() => onPick(t.tableType)}
          >
            <TemplateIcon type={t.tableType} />
            <span className="text-xs font-medium leading-snug text-zinc-200">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
