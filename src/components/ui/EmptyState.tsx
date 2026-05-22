import { btnSecondary, glassCard } from "@/src/lib/ui";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={`${glassCard} text-center`}>
      <p className="text-base font-medium text-white">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button type="button" className={`${btnSecondary} mt-4`} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
