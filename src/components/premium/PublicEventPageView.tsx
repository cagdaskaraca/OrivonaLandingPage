"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchPublicEventBySlug,
  type PublicEventPageData,
} from "@/src/lib/api/premiumSaas";
import { getEventCountdown } from "@/src/lib/eventCountdown";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, glassCard } from "@/src/lib/ui";

export function PublicEventPageView() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];
  const [data, setData] = useState<PublicEventPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Geçersiz etkinlik adresi.");
      setLoading(false);
      return;
    }
    fetchPublicEventBySlug(slug)
      .then((d) => {
        if (!d) setError("Etkinlik bulunamadı.");
        else setData(d);
      })
      .catch((err) => {
        logApiError("Public event", err);
        setError(formatUiErrorMessage(err, "Etkinlik yüklenemedi."));
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const countdown = getEventCountdown(data?.eventDate);

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
          <article className={`${glassCard} text-center`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
              ORIVONA Etkinlik
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              {data.title ?? "Etkinlik"}
            </h1>
            <p
              className={`mt-3 text-lg font-medium ${
                countdown.isPast ? "text-zinc-500" : "text-violet-300"
              }`}
            >
              {countdown.countdownText}
            </p>
            {data.eventDate ? (
              <p className="mt-2 text-sm text-zinc-400">
                {new Date(data.eventDate).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : null}
            {data.location ? (
              <p className="mt-4 text-sm text-zinc-300">{data.location}</p>
            ) : null}
            {data.hostName ? (
              <p className="mt-2 text-sm text-zinc-500">
                Ev sahibi: {data.hostName}
              </p>
            ) : null}
            {data.dressCode ? (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                Kıyafet: {data.dressCode}
              </p>
            ) : null}
            {data.description ? (
              <p className="mt-6 text-left text-sm leading-relaxed text-zinc-400">
                {data.description}
              </p>
            ) : null}
            {data.inviteUrl ? (
              <Link href={data.inviteUrl} className={`${btnPrimary} mt-8 inline-flex`}>
                Katılım Yanıtı / Davetiye
              </Link>
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
