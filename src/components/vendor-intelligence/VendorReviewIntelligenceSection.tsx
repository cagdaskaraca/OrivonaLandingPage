"use client";

import { fetchVendorReviewSummary } from "@/src/lib/api/vendorIntelligence";
import type { ReviewIntelligenceSummary } from "@/src/lib/api/types";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { reviewListItems } from "@/src/lib/vendorCrm";
import { skeletonClass } from "@/src/lib/ui";

export function VendorReviewIntelligenceSection() {
  const { data: summary, loading, error, reload } = useVendorSectionLoad(
    fetchVendorReviewSummary,
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <div className={`${skeletonClass} h-24 w-full rounded-xl`} />
        <div className={`${skeletonClass} h-32 w-full rounded-xl`} />
      </div>
    );
  }

  return (
    <VendorSectionState loading={false} error={error} onRetry={reload}>
      <ReviewSummaryContent summary={summary} />
    </VendorSectionState>
  );
}

function ReviewSummaryContent({
  summary,
}: {
  summary: ReviewIntelligenceSummary | null;
}) {
  if (!summary) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
        Yorum özeti bulunamadı.
      </p>
    );
  }

  const { positives, improvements } = reviewListItems(summary);
  const aiText = summary.aiSummary ?? summary.summary;

  const hasContent =
    aiText?.trim() || positives.length > 0 || improvements.length > 0;

  if (!hasContent) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
        Henüz yeterli yorum verisi yok.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {aiText?.trim() ? (
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-4">
          <h3 className="text-sm font-semibold text-violet-200">AI özeti</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{aiText}</p>
        </div>
      ) : null}
      {positives.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-emerald-200/90">Güçlü yönler</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-400">
            {positives.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {improvements.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-amber-200/90">
            Gelişim alanları
          </h3>
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-400">
            {improvements.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
