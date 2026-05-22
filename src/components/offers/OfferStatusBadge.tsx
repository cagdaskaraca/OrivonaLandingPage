import {
  formatOfferStatus,
  getOfferStatusStyle,
} from "@/src/lib/offerRequest";

export function OfferStatusBadge({ status }: { status?: string | null }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getOfferStatusStyle(status)}`}
    >
      {formatOfferStatus(status)}
    </span>
  );
}
