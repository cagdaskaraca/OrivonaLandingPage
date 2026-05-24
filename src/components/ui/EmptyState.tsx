import Link from "next/link";
import { btnSecondary, glassCard } from "@/src/lib/ui";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  href,
}: EmptyStateProps) {
  return (
    <div className={`${glassCard} px-6 py-10 text-center`}>
      {icon ? (
        <span
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <p className="text-base font-medium text-white">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      ) : null}
      {actionLabel && href ? (
        <Link href={href} className={`${btnSecondary} mt-5 inline-flex`}>
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction && !href ? (
        <button type="button" className={`${btnSecondary} mt-5`} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
