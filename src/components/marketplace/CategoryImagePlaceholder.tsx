import { getCategoryPlaceholder } from "@/src/lib/marketplacePlaceholders";

type CategoryImagePlaceholderProps = {
  categoryName?: string | null;
};

export function CategoryImagePlaceholder({
  categoryName,
}: CategoryImagePlaceholderProps) {
  const visual = getCategoryPlaceholder(categoryName);

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${visual.gradient}`}
      style={{ backgroundImage: visual.pattern }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <span
        className="relative text-5xl drop-shadow-[0_8px_24px_rgba(88,28,135,0.5)]"
        aria-hidden
      >
        {visual.icon}
      </span>
      <p className="relative mt-3 text-sm font-semibold tracking-wide text-violet-100/95">
        {visual.label}
      </p>
      <p className="relative mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        ORIVONA
      </p>
    </div>
  );
}
