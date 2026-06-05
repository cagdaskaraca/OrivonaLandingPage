"use client";

import { useEffect, useState } from "react";
import { CouponCodeField } from "@/src/components/commerce/CouponCodeField";
import type { CouponValidation } from "@/src/lib/api/commerce";
import type { OfferRequest } from "@/src/lib/api/types";
import { btnSecondary } from "@/src/lib/ui";

type OfferCouponActionsProps = {
  offer: OfferRequest;
  mode: "accept" | "apply-retro";
  onCouponReady: (code: string | undefined) => void;
  onApplyRetro?: (code: string) => Promise<void>;
  applying?: boolean;
};

export function OfferCouponActions({
  offer,
  mode,
  onCouponReady,
  onApplyRetro,
  applying,
}: OfferCouponActionsProps) {
  const [validated, setValidated] = useState<CouponValidation | null>(null);
  const [hasUnappliedDraft, setHasUnappliedDraft] = useState(false);
  const serviceId = offer.vendorServiceId;
  const existingCode = offer.couponCode?.trim().toUpperCase();

  useEffect(() => {
    if (existingCode) onCouponReady(existingCode);
  }, [existingCode, onCouponReady]);

  if (existingCode) {
    return (
      <p className="text-xs text-emerald-200/90">
        Kayıtlı kupon: <span className="font-semibold">{existingCode}</span>
      </p>
    );
  }

  if (serviceId == null) return null;

  return (
    <div className="space-y-2">
      <CouponCodeField
        serviceId={serviceId}
        applyLabel="Uygula"
        onValidated={(res) => {
          setValidated(res);
          onCouponReady(res?.valid ? res.code?.trim().toUpperCase() : undefined);
        }}
        onDraftChange={(_draft, unapplied) => {
          setHasUnappliedDraft(unapplied);
          if (unapplied) onCouponReady(undefined);
        }}
      />
      {hasUnappliedDraft ? (
        <p className="text-xs text-amber-200/90">
          Kupon kodunu «Uygula» ile doğrulayın veya alanı boş bırakın.
        </p>
      ) : null}
      {mode === "apply-retro" && onApplyRetro && validated?.valid && validated.code ? (
        <button
          type="button"
          className={`${btnSecondary} text-xs`}
          disabled={applying}
          onClick={() => void onApplyRetro(validated.code!.trim().toUpperCase())}
        >
          {applying ? "Uygulanıyor…" : "Kuponu teklife uygula"}
        </button>
      ) : null}
    </div>
  );
}
