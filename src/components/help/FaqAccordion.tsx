"use client";

import { useState } from "react";
import type { FaqItem } from "@/src/lib/helpContent";
import { glassCard } from "@/src/lib/ui";

type FaqAccordionProps = {
  items: FaqItem[];
  /** Allow multiple open at once */
  allowMultiple?: boolean;
};

export function FaqAccordion({ items, allowMultiple = false }: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!allowMultiple) next.clear();
      next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = openIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`${glassCard} overflow-hidden !p-0 transition-[border-color,box-shadow] ${
              open ? "border-violet-300/25 shadow-[0_0_32px_-12px_rgba(109,40,217,0.35)]" : ""
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
              aria-expanded={open}
              onClick={() => toggle(item.id)}
            >
              <span className="text-sm font-semibold text-white sm:text-base">
                {item.question}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/10 text-violet-200 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="border-t border-white/[0.06] px-5 pb-4 pt-0 text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
