"use client";

import { useState } from "react";
import { validateCoupon, type CouponValidation } from "@/src/lib/api/commerce";
import { formatDiscountPreview } from "@/src/lib/commerceUi";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { formatOfferMoney } from "@/src/lib/offerPricing";
import { btnSecondary, inputClass } from "@/src/lib/ui";

type CouponCodeFieldProps = {
  serviceId: string | number;
  basePrice?: number;
  applyLabel?: string;
  onValidated?: (result: CouponValidation | null) => void;
  /** Kullanıcı yazıyor ama henüz uygulamadı — parent submit'i engellemeli */
  onDraftChange?: (draft: string, hasUnappliedDraft: boolean) => void;
};

export function CouponCodeField({
  serviceId,
  basePrice,
  applyLabel = "Uygula",
  onValidated,
  onDraftChange,
}: CouponCodeFieldProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  function notifyDraft(next: string, applied: CouponValidation | null) {
    const draft = next.trim();
    const hasUnappliedDraft = draft.length > 0 && applied?.code?.toUpperCase() !== draft.toUpperCase();
    onDraftChange?.(next, hasUnappliedDraft);
  }

  async function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await validateCoupon(trimmed, serviceId);
      if (!res.valid) {
        setResult(null);
        onValidated?.(null);
        notifyDraft(trimmed, null);
        setError(res.message ?? "Kupon geçersiz veya süresi dolmuş.");
        return;
      }
      const normalized = {
        ...res,
        code: res.code?.trim().toUpperCase() || trimmed.toUpperCase(),
      };
      setResult(normalized);
      onValidated?.(normalized);
      notifyDraft(trimmed, normalized);
    } catch (err) {
      logApiError("Coupon validate", err);
      setResult(null);
      onValidated?.(null);
      notifyDraft(trimmed, null);
      setError(formatUiErrorMessage(err, "Kupon doğrulanamadı."));
    } finally {
      setLoading(false);
    }
  }

  const preview =
    result?.valid &&
    formatDiscountPreview(result.discountType, result.value);

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-xs font-medium text-zinc-400">İndirim kuponu (isteğe bağlı)</p>
      <div className="flex flex-wrap gap-2">
        <input
          className={`${inputClass} min-w-[10rem] flex-1`}
          placeholder="Kupon kodu"
          value={code}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            setCode(next);
            setResult(null);
            setError(null);
            onValidated?.(null);
            notifyDraft(next, null);
          }}
          disabled={loading}
        />
        <button
          type="button"
          className={`${btnSecondary} shrink-0 text-xs`}
          disabled={loading || !code.trim()}
          onClick={() => void handleApply()}
        >
          {loading ? "Kontrol…" : applyLabel}
        </button>
      </div>
      {preview ? (
        <p className="text-sm font-medium text-emerald-300/95">{preview}</p>
      ) : null}
      {result?.valid ? (
        <p className="text-xs text-emerald-200/90">
          Kupon uygulandı: <span className="font-semibold">{result.code}</span>
          {result.originalPrice != null && result.finalPrice != null ? (
            <>
              {" "}
              · {formatOfferMoney(result.originalPrice)} →{" "}
              {formatOfferMoney(result.finalPrice)}
            </>
          ) : null}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-300/90">{error}</p> : null}
      <p className="text-[11px] text-zinc-600">
        «{applyLabel}» ile doğrulanan kupon teklif talebine eklenir ve kabul
        sırasında da iletilir.
      </p>
    </div>
  );
}
