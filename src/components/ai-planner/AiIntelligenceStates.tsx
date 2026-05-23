"use client";

import type { ReactNode } from "react";
import { AI_INTELLIGENCE_LOADING } from "@/src/lib/aiIntelligenceUi";
import { btnSecondary, glassCard, skeletonClass } from "@/src/lib/ui";

export function AiIntelligenceLoading() {
  return (
    <div
      className={`${glassCard} border-violet-400/25`}
      aria-busy="true"
      aria-label={AI_INTELLIGENCE_LOADING}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500" />
        </span>
        <p className="text-sm font-medium text-violet-100">
          {AI_INTELLIGENCE_LOADING}
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <div className={`${skeletonClass} h-4 w-2/3 max-w-sm`} />
        <div className={`${skeletonClass} h-20 w-full`} />
        <div className={`${skeletonClass} h-4 w-1/2`} />
      </div>
    </div>
  );
}

export function AiIntelligenceError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-200"
    >
      <p className="font-medium text-red-100">Analiz tamamlanamadı</p>
      <p className="mt-2 whitespace-pre-line">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className={`${btnSecondary} mt-3`}
          onClick={onRetry}
        >
          Tekrar dene
        </button>
      ) : null}
    </div>
  );
}

export function AiIntelligenceEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      className={`${glassCard} border-dashed border-violet-400/20 text-center`}
    >
      <p className="font-medium text-white">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}

export function AiIdeaCard({
  title,
  items,
  icon,
}: {
  title: string;
  items?: string[];
  icon?: ReactNode;
}) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.06] to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon ? (
          <span className="text-violet-300/80" aria-hidden>
            {icon}
          </span>
        ) : null}
        <h3 className="text-sm font-semibold text-violet-100/95">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-relaxed text-zinc-300"
          >
            <span className="text-violet-400" aria-hidden>
              ·
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
