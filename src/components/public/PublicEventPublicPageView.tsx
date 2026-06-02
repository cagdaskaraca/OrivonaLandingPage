"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getPublicEventPage } from "@/src/lib/api/publicEventPages";
import { getEventCountdown } from "@/src/lib/eventCountdown";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { glassCard } from "@/src/lib/ui";
import type { PublicEventPageData } from "@/src/lib/api/types";

function formatLocation(city?: string, district?: string): string | null {
  const parts = [district?.trim(), city?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function PublicEventPublicPageView() {
  const params = useParams();
  const slug =
    typeof params.slug === "string" ? params.slug : params.slug?.[0];
  const [data, setData] = useState<PublicEventPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Geçersiz etkinlik adresi.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPublicEventPage(slug)
      .then((d) => {
        if (!d) setError("Etkinlik bulunamadı.");
        else setData(d);
      })
      .catch((err) => {
        logApiError("Public event page", err);
        setError(formatUiErrorMessage(err, "Etkinlik yüklenemedi."));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const countdown = getEventCountdown(data?.eventDate);
  const location = useMemo(
    () => formatLocation(data?.city, data?.district),
    [data?.city, data?.district],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06040c] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.2),transparent_55%)]"
        aria-hidden
      />
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6">
        {loading ? (
          <p className="text-center text-zinc-500">Yükleniyor…</p>
        ) : error ? (
          <p className="text-center text-red-300/90">{error}</p>
        ) : data ? (
          <article className={`${glassCard}`}>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
              ORIVONA Etkinlik
            </p>
            <h1 className="mt-4 text-center text-3xl font-semibold text-white">
              {data.title ?? "Etkinlik"}
            </h1>
            <p
              className={`mt-3 text-center text-lg font-medium ${
                countdown.isPast ? "text-zinc-500" : "text-violet-300"
              }`}
            >
              {countdown.countdownText}
            </p>
            {data.eventDate ? (
              <p className="mt-2 text-center text-sm text-zinc-400">
                {new Date(data.eventDate).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : null}
            {location ? (
              <p className="mt-4 text-center text-sm text-zinc-300">
                {location}
              </p>
            ) : null}
            {data.dressCode ? (
              <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                <span className="font-semibold text-white">Kıyafet kodu:</span>{" "}
                {data.dressCode}
              </p>
            ) : null}
            {data.description ? (
              <p className="mt-6 text-sm leading-relaxed text-zinc-300">
                {data.description}
              </p>
            ) : null}
            {data.note ? (
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                <span className="font-semibold text-zinc-200">Not:</span>{" "}
                {data.note}
              </p>
            ) : null}
          </article>
        ) : null}

        <p className="mt-12 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-violet-300">
            ORIVONA
          </Link>
        </p>
      </main>
    </div>
  );
}

