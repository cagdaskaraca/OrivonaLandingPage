import { formatBadgeLabel } from "@/src/lib/premiumLabels";
import { badgeClass } from "@/src/lib/ui";

const badgeTone: Record<string, string> = {
  Doğrulandı: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  "Premium Partner": "border-amber-300/40 bg-amber-500/15 text-amber-100",
  Popüler: "border-violet-400/30 bg-violet-500/15 text-violet-100",
  "Hızlı Dönüş": "border-sky-400/30 bg-sky-500/15 text-sky-100",
  "Yüksek Puan": "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100",
  Yeni: "border-white/20 bg-white/10 text-zinc-200",
  "Öne Çıkan": "border-amber-300/50 bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-100",
};

type ServiceBadgeChipsProps = {
  badges?: string[];
  className?: string;
};

export function ServiceBadgeChips({ badges, className = "" }: ServiceBadgeChipsProps) {
  const list = (badges ?? []).map(formatBadgeLabel).filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {list.map((label) => (
        <span
          key={label}
          className={`${badgeClass} normal-case tracking-normal ${badgeTone[label] ?? ""}`.trim()}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
