"use client";

import Link from "next/link";
import type { AiMissingServicesResult } from "@/src/lib/api/types";
import {
  AiIntelligenceEmpty,
  AiIdeaCard,
} from "@/src/components/ai-planner/AiIntelligenceStates";
import { marketplaceHrefForCategory } from "@/src/lib/aiIntelligenceUi";
import { btnPrimary, glassCard } from "@/src/lib/ui";

type AiMissingServicesPanelProps = {
  data: AiMissingServicesResult | null;
  hasSearched: boolean;
};

function CategoryChips({
  title,
  items,
  variant,
}: {
  title: string;
  items?: string[];
  variant: "selected" | "missing";
}) {
  if (!items?.length) return null;
  return (
    <div className={`${glassCard} border-white/[0.08]`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((cat) => (
          <span
            key={cat}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              variant === "missing"
                ? "border border-amber-400/30 bg-amber-500/10 text-amber-100"
                : "border border-violet-400/25 bg-violet-500/10 text-violet-100"
            }`}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AiMissingServicesPanel({
  data,
  hasSearched,
}: AiMissingServicesPanelProps) {
  if (!hasSearched) {
    return (
      <AiIntelligenceEmpty
        title="Eksik hizmet analizi burada görünecek"
        description="Planınızdaki kategorileri kontrol etmek için analiz edin."
      />
    );
  }

  if (!data) return null;

  const missing = data.missingCategories ?? [];

  if (
    !missing.length &&
    !data.selectedCategories?.length &&
    !data.recommendedNextSteps?.length
  ) {
    return (
      <AiIntelligenceEmpty
        title="Eksik kategori bulunamadı"
        description="Planınız kapsamlı görünüyor veya daha fazla detay gerekebilir."
      />
    );
  }

  return (
    <div className="space-y-6">
      <CategoryChips
        title="Seçili kategoriler"
        items={data.selectedCategories}
        variant="selected"
      />
      <CategoryChips
        title="Eksik kategoriler"
        items={data.missingCategories}
        variant="missing"
      />

      {missing.length > 0 ? (
        <div className={`${glassCard} border-violet-400/20`}>
          <p className="text-sm font-semibold text-white">
            Marketplace&apos;te ara
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Eksik kategoriler için hizmet arayın.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {missing.map((cat) => (
              <Link
                key={cat}
                href={marketplaceHrefForCategory(cat)}
                className={`${btnPrimary} !px-4 !py-2 text-xs`}
              >
                {cat} ara
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <AiIdeaCard
        title="Önerilen sonraki adımlar"
        items={data.recommendedNextSteps}
        icon="→"
      />
    </div>
  );
}
