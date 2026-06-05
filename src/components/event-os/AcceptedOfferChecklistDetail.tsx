"use client";

import type { CustomerAgreement } from "@/src/lib/api/types";
import {
  formatAgreementDate,
  formatAgreementStatus,
  formatTryCurrency,
} from "@/src/lib/customerAgreementsUi";
import { getOfferStatusStyle } from "@/src/lib/offerRequest";

type AcceptedOfferChecklistDetailProps = {
  agreement: CustomerAgreement;
};

export function AcceptedOfferChecklistDetail({
  agreement,
}: AcceptedOfferChecklistDetailProps) {
  const vendorName = agreement.vendorName?.trim() || "İşletme";
  const dateLabel = formatAgreementDate(agreement.agreementDate);
  const note = agreement.note?.trim();
  const originalPrice = agreement.originalPrice;
  const finalPrice =
    agreement.finalPrice ?? agreement.agreedPrice;
  const hasDiscount =
    originalPrice != null &&
    finalPrice != null &&
    finalPrice < originalPrice;
  const status = formatAgreementStatus(agreement.status);
  const statusStyle = getOfferStatusStyle(
    agreement.status ?? "CustomerAccepted",
  );

  return (
    <div className="mt-2 space-y-1 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2.5">
      <p className="text-sm font-semibold text-white">{vendorName}</p>
      <div>
        {hasDiscount ? (
          <p className="text-xs text-zinc-500 line-through">
            {formatTryCurrency(originalPrice)}
          </p>
        ) : null}
        <p className="text-sm font-medium text-emerald-200">
          {formatTryCurrency(finalPrice)}
        </p>
        {hasDiscount && agreement.discountAmount != null ? (
          <p className="text-[11px] text-emerald-300/90">
            İndirim: {formatTryCurrency(agreement.discountAmount)}
            {agreement.couponCode ? ` · ${agreement.couponCode}` : ""}
          </p>
        ) : null}
      </div>
      {note ? (
        <p className="text-xs leading-relaxed text-zinc-400">{note}</p>
      ) : null}
      {dateLabel ? (
        <p className="text-[11px] text-zinc-500">{dateLabel}</p>
      ) : null}
      <span
        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle}`}
      >
        {status}
      </span>
    </div>
  );
}
