"use client";

import type { CustomerAgreement } from "@/src/lib/api/types";
import {
  agreementDisplayDescription,
  agreementDisplayName,
  agreementDisplayStatus,
  formatTurkishLira,
} from "@/src/lib/customerAgreementsUi";
import { getOfferStatusStyle } from "@/src/lib/offerRequest";

type AcceptedOfferChecklistDetailProps = {
  agreement: CustomerAgreement;
};

export function AcceptedOfferChecklistDetail({
  agreement,
}: AcceptedOfferChecklistDetailProps) {
  const description = agreementDisplayDescription(agreement);
  const status = agreementDisplayStatus(agreement);
  const statusStyle = getOfferStatusStyle(agreement.status ?? "AcceptedByCustomer");

  return (
    <div className="mt-2 space-y-1 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2.5">
      <p className="text-sm font-semibold text-white">
        {agreementDisplayName(agreement)}
      </p>
      <p className="text-sm font-medium text-emerald-200">
        {formatTurkishLira(agreement.agreedPrice)}
      </p>
      {description ? (
        <p className="text-xs leading-relaxed text-zinc-400">{description}</p>
      ) : null}
      <span
        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle}`}
      >
        {status}
      </span>
    </div>
  );
}
