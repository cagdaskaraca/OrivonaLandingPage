"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const userLines = [
  "120 kişilik modern nişan organizasyonu",
  "350.000 TL bütçe",
  "İstanbul Avrupa Yakası",
] as const;

const recommendations = [
  { title: "Mekan önerisi", body: "Boğaz hattı · 120 kapasiteli modern salonlar" },
  { title: "Catering önerisi", body: "Fusion menü · vegan seçenekler dahil" },
  { title: "Renk paleti", body: "Lavanta · fildişi · soft gold vurgular" },
  { title: "DJ önerisi", body: "Deep house & Türkçe pop · 4+ saat set" },
  { title: "Fotoğrafçı önerisi", body: "Editorial + drone · 48s teslimat önizleme" },
] as const;

type Phase = "idle" | "user" | "thinking" | "cards";

export function AiPlanningDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [userIdx, setUserIdx] = useState(-1);
  const [cardIdx, setCardIdx] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const q = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    const runCycle = () => {
      if (cancelled) return;
      timers.forEach(clearTimeout);
      timers.length = 0;

      setPhase("idle");
      setUserIdx(-1);
      setCardIdx(-1);

      q(() => {
        if (cancelled) return;
        setPhase("user");
        setUserIdx(0);
      }, 500);

      userLines.forEach((_, i) => {
        if (i === 0) return;
        q(() => {
          if (cancelled) return;
          setUserIdx(i);
        }, 500 + i * 700);
      });

      q(() => {
        if (cancelled) return;
        setPhase("thinking");
      }, 500 + userLines.length * 700 + 400);

      q(() => {
        if (cancelled) return;
        setPhase("cards");
        setCardIdx(0);
        recommendations.forEach((_, i) => {
          if (i === 0) return;
          q(() => {
            if (cancelled) return;
            setCardIdx(i);
          }, 200 + i * 220);
        });
      }, 500 + userLines.length * 700 + 400 + 1100);
    };

    runCycle();
    const interval = setInterval(runCycle, 13500);

    return () => {
      cancelled = true;
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  const userVisible = (i: number) =>
    (phase === "user" || phase === "thinking" || phase === "cards") &&
    userIdx >= i;

  const cardVisible = (i: number) => phase === "cards" && cardIdx >= i;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
      <div className="order-2 space-y-4 lg:order-1 lg:min-w-0">
        <div className="rounded-2xl border border-violet-400/20 bg-black/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-white/10 pb-3">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-medium uppercase tracking-wider text-violet-200/90">
              ORIVONA AI · Planlama motoru
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-hidden">
            {userLines.map((line, i) => (
              <div key={line} className="flex shrink-0 justify-end">
                <div
                  className={`max-w-[92%] rounded-2xl rounded-br-md border border-violet-500/25 bg-violet-500/15 px-4 py-2.5 text-sm text-violet-50/95 shadow-[0_8px_32px_-12px_rgba(109,40,217,0.4)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-opacity ${
                    userVisible(i)
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  {line}
                </div>
              </div>
            ))}

            <div
              className={`flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400 transition-opacity duration-300 ease-out ${
                phase === "thinking" ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={phase !== "thinking"}
            >
              <span className="inline-flex shrink-0 gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
              </span>
              <span>Senaryo analizi ve eşleştirme yapılıyor…</span>
            </div>

            {recommendations.map((r, i) => (
              <div
                key={r.title}
                className={`shrink-0 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-violet-500/5 px-4 py-3 transition-[opacity,transform] duration-500 ease-out motion-reduce:transform-none motion-reduce:transition-opacity ${
                  cardVisible(i)
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/90">
                  Öneri
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{r.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] text-zinc-600 lg:text-left">
          Canlı veri değildir — ürün deneyimini temsil eden simülasyondur.
        </p>
      </div>

      <div className="order-1 flex w-full justify-center lg:order-2 lg:min-w-0 lg:justify-center">
        <div className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-none lg:origin-center lg:scale-[1.02] xl:scale-[1.05] motion-reduce:scale-100">
          <div
            className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-b from-violet-500/40 via-fuchsia-500/18 to-transparent blur-3xl sm:-inset-6 lg:-inset-7"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-violet-300/25 bg-gradient-to-br from-white/[0.12] to-white/[0.02] p-1.5 shadow-[0_32px_88px_-22px_rgba(109,40,217,0.62)] backdrop-blur-xl sm:rounded-[2rem] sm:p-2 lg:rounded-[2.25rem]">
            <Image
              src="/ai-dashboard-preview.png"
              alt="ORIVONA AI planlama paneli önizlemesi"
              width={1600}
              height={1000}
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="h-auto w-full rounded-xl object-cover sm:rounded-2xl lg:rounded-[1.75rem]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
