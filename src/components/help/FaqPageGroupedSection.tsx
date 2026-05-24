"use client";

import { FaqAccordion } from "@/src/components/help/FaqAccordion";
import {
  FAQ_PAGE_SECTIONS,
  getFaqItemsByIds,
} from "@/src/lib/helpFaqContent";

export function FaqPageGroupedSection() {
  return (
    <div className="space-y-14">
      {FAQ_PAGE_SECTIONS.map((section) => {
        const items = getFaqItemsByIds(section.itemIds);
        if (items.length === 0) return null;

        return (
          <section key={section.id} id={`faq-${section.id}`} className="scroll-mt-28">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                {section.label}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">{section.description}</p>
            </div>
            <FaqAccordion items={items} allowMultiple />
          </section>
        );
      })}
    </div>
  );
}
