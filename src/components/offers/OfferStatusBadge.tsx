import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { StatusDisplayContext } from "@/src/lib/statusLabels";

type OfferStatusBadgeProps = {
  status?: string | null;
  context?: StatusDisplayContext;
};

export function OfferStatusBadge({
  status,
  context = "customer",
}: OfferStatusBadgeProps) {
  return <StatusBadge status={status} context={context} />;
}
