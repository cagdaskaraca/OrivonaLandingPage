import { PAYMENT_COMING_SOON } from "@/src/lib/commerceUi";

type PaymentComingSoonNoticeProps = {
  className?: string;
  compact?: boolean;
};

export function PaymentComingSoonNotice({
  className = "",
  compact = false,
}: PaymentComingSoonNoticeProps) {
  return (
    <p
      className={`rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-100/90 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      } ${className}`}
      role="status"
    >
      {PAYMENT_COMING_SOON}
    </p>
  );
}
