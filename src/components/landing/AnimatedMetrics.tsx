"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, durationMs: number, active: boolean) {
  const [v, setV] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setV(0);
      start.current = null;
      return;
    }
    let raf: number;
    const tick = (now: number) => {
      if (start.current == null) start.current = now;
      const t = Math.min(1, (now - start.current) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, durationMs]);

  return v;
}

const items = [
  { label: "Erken erişim kayıtları", target: 2840, suffix: "+" },
  { label: "Partner işletme", target: 128, suffix: "+" },
  { label: "Planlanan etkinlik", target: 960, suffix: "+" },
  { label: "AI öneri isabeti", target: 94, suffix: "%" },
] as const;

export function AnimatedMetrics() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setActive(true);
      },
      { threshold: 0.15 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const v0 = useCountUp(items[0].target, 2200, active);
  const v1 = useCountUp(items[1].target, 2000, active);
  const v2 = useCountUp(items[2].target, 2200, active);
  const v3 = useCountUp(items[3].target, 1800, active);
  const values = [v0, v1, v2, v3];

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className="group rounded-2xl border border-violet-200/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-5 py-6 text-center shadow-[0_12px_40px_-18px_rgba(88,28,135,0.45)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.35)]"
        >
          <p className="bg-gradient-to-r from-white to-violet-200/90 bg-clip-text text-3xl font-semibold tabular-nums tracking-tight text-transparent sm:text-4xl">
            {values[i]}
            {item.suffix}
          </p>
          <p className="mt-2 text-xs font-medium text-zinc-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
