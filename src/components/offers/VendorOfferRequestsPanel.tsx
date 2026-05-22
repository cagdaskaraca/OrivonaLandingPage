"use client";

import { useCallback, useEffect, useState } from "react";
import { OfferRequestCard } from "@/src/components/offers/OfferRequestCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useToast } from "@/src/contexts/ToastContext";
import {
  fetchVendorOfferRequests,
  respondVendorOffer,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { OfferRequest } from "@/src/lib/api/types";
import { isOfferPending } from "@/src/lib/offerRequest";
import {
  btnPrimary,
  btnSecondary,
  glassCard,
  inputClass,
  skeletonClass,
} from "@/src/lib/ui";

export function VendorOfferRequestsPanel() {
  const toast = useToast();
  const [offers, setOffers] = useState<OfferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | number | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await fetchVendorOfferRequests());
    } catch (e) {
      if (e instanceof ApiError) console.log("Vendor offer requests failed", e.body);
      setOffers([]);
      setError(formatApiErrorMessage(e, "Teklif talepleri yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openRespond(offer: OfferRequest) {
    setRespondingId(offer.id ?? null);
    setPrice(
      offer.offeredPrice != null || offer.price != null
        ? String(offer.offeredPrice ?? offer.price)
        : "",
    );
    setDescription(offer.responseDescription ?? offer.description ?? "");
    setValidUntil(
      offer.validUntil?.slice(0, 10) ??
        new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    );
  }

  function cancelRespond() {
    setRespondingId(null);
    setPrice("");
    setDescription("");
    setValidUntil("");
  }

  async function submitRespond(id: string | number, accept: boolean) {
    if (accept && (!price.trim() || !description.trim())) {
      toast.error("Kabul için fiyat ve açıklama zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await respondVendorOffer(id, {
        price: accept ? Number(price) : 0,
        description: description.trim(),
        validUntil: validUntil.trim(),
        accept,
      });
      toast.success(accept ? "Teklif kabul edildi." : "Teklif reddedildi.");
      cancelRespond();
      load();
    } catch (e) {
      if (e instanceof ApiError) console.log("Offer respond failed", e.body);
      toast.error(formatApiErrorMessage(e, "Yanıt gönderilemedi."));
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = offers.filter((o) => isOfferPending(o.status)).length;

  return (
    <div className={`${glassCard} mb-8`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Gelen teklif talepleri</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {pendingCount > 0
              ? `${pendingCount} bekleyen talep`
              : "Bekleyen talep yok"}
          </p>
        </div>
        <button
          type="button"
          className={`${btnSecondary} text-xs`}
          onClick={load}
          disabled={loading}
        >
          Yenile
        </button>
      </div>

      {loading ? <div className={`${skeletonClass} h-32`} /> : null}

      {!loading && error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading && !error && offers.length === 0 ? (
        <EmptyState
          title="Gelen teklif talebi yok"
          description="Müşteriler marketplace üzerinden teklif istediğinde burada görünür."
        />
      ) : null}

      {!loading && !error && offers.length > 0 ? (
        <ul className="mt-2 space-y-4">
          {offers.map((o) => (
            <li key={String(o.id)}>
              <OfferRequestCard offer={o} variant="vendor" />
              {isOfferPending(o.status) && o.id != null ? (
                respondingId === o.id ? (
                  <div className="mt-3 space-y-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
                      Yanıtınız
                    </p>
                    <label className="block text-sm">
                      <span className="mb-1 block text-xs text-zinc-400">Fiyat (₺)</span>
                      <input
                        type="number"
                        min={0}
                        className={inputClass}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block text-xs text-zinc-400">Açıklama</span>
                      <textarea
                        className={`${inputClass} min-h-[72px] resize-y`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Paket detayı, dahil olanlar…"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block text-xs text-zinc-400">
                        Geçerlilik tarihi
                      </span>
                      <input
                        type="date"
                        className={inputClass}
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={btnPrimary}
                        disabled={submitting}
                        onClick={() => submitRespond(o.id!, true)}
                      >
                        {submitting ? "Gönderiliyor…" : "Kabul Et"}
                      </button>
                      <button
                        type="button"
                        className={btnSecondary}
                        disabled={submitting}
                        onClick={() => submitRespond(o.id!, false)}
                      >
                        Reddet
                      </button>
                      <button
                        type="button"
                        className={`${btnSecondary} text-xs`}
                        onClick={cancelRespond}
                        disabled={submitting}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`${btnSecondary} mt-3 text-xs`}
                    onClick={() => openRespond(o)}
                  >
                    Yanıtla
                  </button>
                )
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
