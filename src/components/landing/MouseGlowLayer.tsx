"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Subtle cursor-following lavender glow; throttled for performance. */
export function MouseGlowLayer() {
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
      className="pointer-events-none fixed inset-0 z-[1] hidden opacity-40 md:block"
      aria-hidden
    >
      <div
        className="absolute h-[min(85vh,52rem)] w-[min(85vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.22)_0%,rgba(192,132,252,0.08)_35%,transparent_65%)] blur-3xl transition-[left,top] duration-700 ease-out"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
      />
    </div>
  );
}
