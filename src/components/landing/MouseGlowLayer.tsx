"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MouseGlowLayerProps = {
  /** When true, positions inside OrivonaGlobalBackground (not viewport-fixed). */
  embedded?: boolean;
};

/** Subtle cursor-following lavender glow; throttled; desktop only. */
export function MouseGlowLayer({ embedded = false }: MouseGlowLayerProps) {
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const frame = useRef<number | undefined>(undefined);
  const pending = useRef<{ x: number; y: number } | null>(null);

  const flush = useCallback(() => {
    frame.current = undefined;
    if (pending.current) {
      setPos(pending.current);
      pending.current = null;
    }
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || coarsePointer) return;

    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 100;
      const ny = (e.clientY / window.innerHeight) * 100;
      pending.current = { x: nx, y: ny };
      if (frame.current == null) {
        frame.current = requestAnimationFrame(flush);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [flush]);

  return (
    <div
      className={`orivona-global-mouse-glow pointer-events-none inset-0 hidden opacity-[0.32] md:block ${
        embedded ? "absolute z-[1]" : "fixed z-[1]"
      }`}
      aria-hidden
    >
      <div
        className="absolute h-[min(85vh,52rem)] w-[min(85vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,rgba(167,139,250,0.18)_18%,rgba(192,132,252,0.07)_40%,transparent_68%)] blur-3xl transition-[left,top] duration-700 ease-out"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
      />
    </div>
  );
}
