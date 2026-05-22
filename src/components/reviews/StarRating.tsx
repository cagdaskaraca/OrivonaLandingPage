"use client";

type StarRatingProps = {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClasses = {
  sm: "h-4 w-4 text-base",
  md: "h-5 w-5 text-lg",
  lg: "h-7 w-7 text-2xl",
};

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <span className="relative inline-block">
        <span className="text-zinc-600">★</span>
        <span className="absolute left-0 top-0 w-1/2 overflow-hidden text-amber-300">
          ★
        </span>
      </span>
    );
  }
  return (
    <span className={filled ? "text-amber-300" : "text-zinc-600"}>★</span>
  );
}

export function StarRating({
  value,
  max = 5,
  onChange,
  size = "md",
  label,
}: StarRatingProps) {
  const interactive = Boolean(onChange);
  const rounded = Math.round(value * 2) / 2;
  const cls = sizeClasses[size];

  return (
    <div
      className="inline-flex flex-col gap-1"
      role={interactive ? "group" : "img"}
      aria-label={label ?? `${value} / ${max} yıldız`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                className={`${cls} leading-none transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 ${
                  filled || half ? "text-amber-300" : "text-zinc-600 hover:text-amber-200/80"
                }`}
                onClick={() => onChange?.(star)}
                aria-label={`${star} yıldız`}
              >
                ★
              </button>
            );
          }
          return (
            <span key={star} className={`${cls} leading-none`} aria-hidden>
              <StarIcon filled={filled} half={half} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function formatRatingDisplay(value?: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1).replace(".", ",");
}
