import {
  cancelCustomerOffer,
  cancelCustomerOfferRequest,
} from "@/src/lib/api/domains";
import type { OfferRequest } from "@/src/lib/api/types";
import { getCustomerCancelTarget } from "@/src/lib/offerRequest";

/** Bekleyen talep veya gönderilmiş/kabul edilmiş teklifi iptal eder. */
export async function cancelCustomerOfferFlow(
  offer: OfferRequest,
  reason?: string,
): Promise<OfferRequest> {
  const target = getCustomerCancelTarget(offer);
  if (target == null) {
    throw new Error("Bu teklif iptal edilemez.");
  }
  const payload = { reason };
  if (target.kind === "offer") {
    return cancelCustomerOffer(target.id, payload);
  }
  return cancelCustomerOfferRequest(target.id, payload);
}
