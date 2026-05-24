"use client";

import { useEffect, useState, type ReactNode } from "react";

type OnboardingHintProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export function OnboardingHint({ id, children, className = "" }: OnboardingHintProps) {
  const storageKey = `orivona-hint-dismissed-${id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(storageKey) !== "1");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-violet-400/20 bg-violet-500/[0.08] px-3 py-2 text-xs leading-relaxed text-violet-100/90 ${className}`.trim()}
      role="note"
    >
      <span className="shrink-0 text-violet-300" aria-hidden>
        💡
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      <button
        type="button"
        className="shrink-0 text-violet-300/70 transition hover:text-white"
        aria-label="İpucunu kapat"
        onClick={() => {
          try {
            localStorage.setItem(storageKey, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        ×
      </button>
    </div>
  );
}
