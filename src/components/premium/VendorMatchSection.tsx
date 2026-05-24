"use client";

import Link from "next/link";
import { useState } from "react";
import {
  fetchAiVendorMatch,
  type VendorMatchResult,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

type VendorMatchSectionProps = {
  matchPayload: unknown;
  onOfferRequest?: (serviceId: string | number) => void;
};

export function VendorMatchSection({
  matchPayload,
  onOfferRequest,
}: VendorMatchSectionProps) {
  const [matches, setMatches] = useState<VendorMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMatches() {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAiVendorMatch(matchPayload);
      setMatches(list);
      if (list.length === 0) setUnavailable(false);
    } catch (err) {
      logApiError("Vendor match", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Eşleşmeler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">İşletme eşleştirme hazırlanıyor.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">
          Sana En Uygun İşletmeler
        </h3>
        <button
          type="button"
          className={btnPrimary}
          disabled={loading}
          onClick={() => void loadMatches()}
        >
          {loading ? "Aranıyor…" : "Eşleşmeleri bul"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      {matches.length === 0 && !loading ? (
        <p className="text-sm text-zinc-500">
          Plan oluşturduktan sonra eşleşmeleri listeleyin.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {matches.map((m, i) => (
            <article key={String(m.serviceId ?? i)} className={glassCard}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">
                    {m.serviceTitle ?? "Hizmet"}
                  </p>
                  <p className="text-sm text-zinc-400">{m.vendorName}</p>
                </div>
                {m.matchScore != null ? (
                  <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-100">
                    %{Math.round(m.matchScore)}
                  </span>
                ) : null}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                {m.priceFit != null ? (
                  <div>
                    <dt>Fiyat uyumu</dt>
                    <dd className="text-zinc-300">%{Math.round(m.priceFit)}</dd>
                  </div>
                ) : null}
                {m.locationFit != null ? (
                  <div>
                    <dt>Lokasyon</dt>
                    <dd className="text-zinc-300">%{Math.round(m.locationFit)}</dd>
                  </div>
                ) : null}
                {m.styleFit != null ? (
                  <div>
                    <dt>Stil</dt>
                    <dd className="text-zinc-300">%{Math.round(m.styleFit)}</dd>
                  </div>
                ) : null}
                {m.availabilityFit != null ? (
                  <div>
                    <dt>Müsaitlik</dt>
                    <dd className="text-zinc-300">
                      %{Math.round(m.availabilityFit)}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {m.reasons && m.reasons.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                  {m.reasons.slice(0, 3).map((r, j) => (
                    <li key={j}>• {r}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {m.serviceId != null ? (
                  <Link
                    href={`/services/${encodeURIComponent(String(m.serviceId))}`}
                    className={`${btnSecondary} !px-3 !py-1.5 text-xs`}
                  >
                    Detayları gör
                  </Link>
                ) : null}
                {m.serviceId != null && onOfferRequest ? (
                  <button
                    type="button"
                    className={`${btnPrimary} !px-3 !py-1.5 text-xs`}
                    onClick={() => onOfferRequest(m.serviceId!)}
                  >
                    Teklif iste
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
