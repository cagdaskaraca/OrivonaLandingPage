"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchActiveCampaigns, type Campaign } from "@/src/lib/api/commerce";
import { logApiError } from "@/src/lib/api/client";
import { glassCard } from "@/src/lib/ui";

type ActiveCampaignBannerProps = {
  className?: string;
};

export function ActiveCampaignBanner({ className = "" }: ActiveCampaignBannerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchActiveCampaigns();
        if (!cancelled) setCampaigns(list.filter((c) => c.isActive !== false));
      } catch (err) {
        logApiError("Active campaigns", err);
        if (!cancelled) setCampaigns([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % campaigns.length);
    }, 8000);
    return () => window.clearInterval(t);
  }, [campaigns.length]);

  if (loading || campaigns.length === 0) return null;

  const c = campaigns[index]!;
  const text = c.bannerText ?? c.title;
  const href = c.ctaHref ?? "/marketplace";

  return (
    <div
      className={`${glassCard} group relative mb-6 overflow-hidden border-violet-400/25 bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-violet-900/20 !py-4 transition-[box-shadow,transform] duration-300 hover:shadow-[0_0_36px_-10px_rgba(139,92,246,0.55)] ${className}`}
      role="region"
      aria-label="Kampanya"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_0%_50%,rgba(167,139,250,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative flex items-center gap-4 px-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/20 text-violet-100 shadow-[0_0_20px_-6px_rgba(139,92,246,0.6)] transition-transform duration-300 group-hover:scale-[1.04]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
            {c.title}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-zinc-200">{text}</p>
          {c.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{c.description}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/30"
        >
          {c.ctaLabel ?? "Keşfet"}
        </Link>
      </div>
      {campaigns.length > 1 ? (
        <div className="relative mt-3 flex justify-center gap-1.5">
          {campaigns.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Kampanya ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-violet-400" : "w-1.5 bg-white/20"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
