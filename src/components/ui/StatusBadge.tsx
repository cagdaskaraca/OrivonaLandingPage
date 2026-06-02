import {
  getStatusBadgeClassName,
  getStatusLabel,
  type StatusDisplayContext,
} from "@/src/lib/statusLabels";

type StatusBadgeProps = {
  status?: string | null;
  context?: StatusDisplayContext;
  className?: string;
};

export function StatusBadge({
  status,
  context = "default",
  className = "",
}: StatusBadgeProps) {
  const label = getStatusLabel(status, context);
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClassName(status)} ${className}`}
    >
      {label}
    </span>
  );
}
