"use client";

import {
  AI_PLANNER_TABS,
  type AiPlannerTabId,
} from "@/src/lib/aiIntelligenceUi";

type AiPlannerTabsProps = {
  active: AiPlannerTabId;
  onChange: (tab: AiPlannerTabId) => void;
};

export function AiPlannerTabs({ active, onChange }: AiPlannerTabsProps) {
  return (
    <div className="mb-6 overflow-x-auto pb-1">
      <div
        className="inline-flex min-w-full gap-1 rounded-2xl border border-violet-500/20 bg-[#0a0612]/60 p-1 sm:min-w-0"
        role="tablist"
        aria-label="AI planlayıcı modları"
      >
        {AI_PLANNER_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                isActive
                  ? "bg-gradient-to-r from-violet-600/90 to-fuchsia-600/80 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-violet-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
