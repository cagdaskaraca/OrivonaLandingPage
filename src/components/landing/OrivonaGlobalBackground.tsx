"use client";

import { MouseGlowLayer } from "@/src/components/landing/MouseGlowLayer";

/** Fixed viewport backdrop: homepage gradients + grid (all routes). */
export function OrivonaGlobalBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.18),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_20%,rgba(192,132,252,0.08),transparent)]" />
      <div className="absolute left-1/2 top-20 h-[min(540px,85vh)] w-[min(92vw,58rem)] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-400/22 via-purple-600/12 to-transparent blur-3xl" />
      <div className="absolute bottom-[10%] left-[-15%] h-[420px] w-[420px] rounded-full bg-indigo-900/25 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(167,139,250,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
      <MouseGlowLayer embedded />
    </div>
  );
}
