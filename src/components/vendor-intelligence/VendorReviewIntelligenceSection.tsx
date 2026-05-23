"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchVendorReviewSummary } from "@/src/lib/api/vendorIntelligence";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { ReviewIntelligenceSummary } from "@/src/lib/api/types";
import { reviewListItems } from "@/src/lib/vendorCrm";
import { btnSecondary, skeletonClass } from "@/src/lib/ui";

export function VendorReviewIntelligenceSection() {
  const [summary, setSummary] = useState<ReviewIntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await fetchVendorReviewSummary());
    } catch (err) {
      logApiError("Vendor review summary", err);
      setSummary(null);
      setError(formatUiErrorMessage(err, "Yorum özeti yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className={`${skeletonClass} h-24 w-full rounded-xl`} />
        <div className={`${skeletonClass} h-32 w-full rounded-xl`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>{error}</p>
        <button
          type="button"
          className={`${btnSecondary} mt-3 text-xs`}
          onClick={() => void load()}
        >
          Tekrar dene
        </button>
      </div>
    );
  }

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
        <div className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.1] to-fuchsia-500/[0.05] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            AI yorum özeti
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{aiText}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
            Olumlu öne çıkanlar
          </p>
          {positives.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-emerald-100/90">
              {positives.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden>+</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">—</p>
          )}
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
            Geliştirilmesi gerekenler
          </p>
          {improvements.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-amber-100/90">
              {improvements.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden>→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
