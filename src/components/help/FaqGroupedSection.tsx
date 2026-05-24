"use client";

import { useMemo, useState } from "react";
import { FaqAccordion } from "@/src/components/help/FaqAccordion";
import type { FaqCategory, FaqSection } from "@/src/lib/helpFaqContent";
import { FAQ_SECTIONS } from "@/src/lib/helpFaqContent";
import { btnSecondary } from "@/src/lib/ui";

type Filter = "all" | FaqCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "customer", label: "Müşteri" },
  { id: "vendor", label: "İşletme" },
  { id: "admin", label: "Admin" },
];

type FaqGroupedSectionProps = {
  sections?: FaqSection[];
};

export function FaqGroupedSection({
  sections = FAQ_SECTIONS,
}: FaqGroupedSectionProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const visibleSections = useMemo(() => {
    if (filter === "all") return sections;
    return sections.filter((s) => s.category === filter);
  }, [filter, sections]);

  return (
    <div>
      <div
        className="mb-8 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="SSS kategorileri"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`${btnSecondary} !px-4 !py-2 text-xs ${
              filter === f.id
                ? "!border-violet-400/40 !bg-violet-500/20 !text-violet-100"
                : ""
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {visibleSections.map((section) => (
          <div key={section.category}>
            {filter === "all" ? (
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white">{section.label}</h3>
                <p className="mt-1 text-sm text-zinc-500">{section.description}</p>
              </div>
            ) : null}
            <FaqAccordion items={section.items} allowMultiple={filter !== "all"} />
          </div>
        ))}
      </div>
    </div>
  );
}
