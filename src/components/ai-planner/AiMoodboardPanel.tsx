"use client";

import type { AiMoodboardResult } from "@/src/lib/api/types";
import { AiIdeaCard, AiIntelligenceEmpty } from "@/src/components/ai-planner/AiIntelligenceStates";
import { isHexColor } from "@/src/lib/aiIntelligenceUi";
import { glassCard } from "@/src/lib/ui";

type AiMoodboardPanelProps = {
  data: AiMoodboardResult | null;
  hasSearched: boolean;
};

export function AiMoodboardPanel({ data, hasSearched }: AiMoodboardPanelProps) {
  if (!hasSearched) {
    return (
      <AiIntelligenceEmpty
        title="Moodboard burada görünecek"
        description="Etkinlik isteğinizi yazıp Moodboard oluştur'a basın."
      />
    );
  }

  if (!data) return null;

  const hasContent =
    data.themeTitle?.trim() ||
    (data.colorPalette?.length ?? 0) > 0 ||
    (data.decorationIdeas?.length ?? 0) > 0;

  if (!hasContent) {
    return (
      <AiIntelligenceEmpty
        title="Moodboard oluşturulamadı"
        description="İsteğinizi daha ayrıntılı yazmayı deneyin."
      />
    );
  }

  return (
    <div className="space-y-6">
      {data.themeTitle?.trim() ? (
        <div
          className={`${glassCard} border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-transparent text-center`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-300/80">
            Tema
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{data.themeTitle}</h2>
        </div>
      ) : null}

      {data.colorPalette?.length ? (
        <div className={`${glassCard} border-violet-400/15`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Renk paleti
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {data.colorPalette.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1.5">
                <span
                  className="h-12 w-12 rounded-xl border border-white/20 shadow-inner"
                  style={{
                    background: isHexColor(color)
                      ? color
                      : "linear-gradient(135deg, #6d28d9, #a855f7)",
                  }}
                  title={color}
                />
                <span className="max-w-[72px] truncate text-[10px] text-zinc-500">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AiIdeaCard title="Dekorasyon" items={data.decorationIdeas} icon="✦" />
        <AiIdeaCard title="Müzik" items={data.musicIdeas} icon="♫" />
        <AiIdeaCard title="Kıyafet kodu" items={data.dressCodeIdeas} icon="◇" />
        <AiIdeaCard title="Yemek & içecek" items={data.foodIdeas} icon="◈" />
        <AiIdeaCard
          title="Fotoğraf stili"
          items={data.photoStyleIdeas}
          icon="◎"
        />
      </div>
    </div>
  );
}
