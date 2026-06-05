"use client";

import { useState } from "react";
import { validateCoupon, type CouponValidation } from "@/src/lib/api/commerce";
import { formatDiscountPreview } from "@/src/lib/commerceUi";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnSecondary, inputClass } from "@/src/lib/ui";

type CouponCodeFieldProps = {
  serviceId: string | number;
  basePrice?: number;
  onValidated?: (result: CouponValidation | null) => void;
};

export function CouponCodeField({
  serviceId,
  basePrice,
  onValidated,
}: CouponCodeFieldProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleValidate() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await validateCoupon(trimmed, serviceId);
      if (!res.valid) {
        setResult(null);
        onValidated?.(null);
        setError(res.message ?? "Kupon geçersiz veya süresi dolmuş.");
        return;
      }
      setResult(res);
      onValidated?.(res);
    } catch (err) {
      logApiError("Coupon validate", err);
      setResult(null);
      onValidated?.(null);
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
            setCode(e.target.value.toUpperCase());
            setResult(null);
            setError(null);
            onValidated?.(null);
          }}
          disabled={loading}
        />
        <button
          type="button"
          className={`${btnSecondary} shrink-0 text-xs`}
          disabled={loading || !code.trim()}
          onClick={() => void handleValidate()}
        >
          {loading ? "Kontrol…" : "Doğrula"}
        </button>
      </div>
      {preview ? (
        <p className="text-sm font-medium text-emerald-300/95">{preview}</p>
      ) : null}
      {result?.valid && basePrice != null && result.discountAmount != null ? (
        <p className="text-xs text-zinc-500">
          Tahmini indirim: {result.discountAmount.toLocaleString("tr-TR")} ₺
          {result.finalPrice != null
            ? ` · Tahmini tutar: ${result.finalPrice.toLocaleString("tr-TR")} ₺`
            : null}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-300/90">{error}</p> : null}
      <p className="text-[11px] text-zinc-600">
        Doğrulanan kupon teklif talebine eklenir. Nihai indirim teklif kabulünde
        uygulanır.
      </p>
    </div>
  );
}
