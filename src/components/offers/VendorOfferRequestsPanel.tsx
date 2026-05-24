"use client";

import { useState } from "react";
import { OfferRequestCard } from "@/src/components/offers/OfferRequestCard";
import { VendorSendOfferModal } from "@/src/components/offers/VendorSendOfferModal";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useToast } from "@/src/contexts/ToastContext";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import {
  fetchVendorOfferRequests,
  rejectVendorOfferRequest,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type { OfferRequest } from "@/src/lib/api/types";
import {
  canVendorActOnRequest,
  isPendingVendorResponse,
} from "@/src/lib/offerRequest";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none";

export function VendorOfferRequestsPanel() {
  const toast = useToast();
  const {
    data,
    loading,
    error,
    reload: load,
  } = useVendorSectionLoad(fetchVendorOfferRequests);
  const offers = data ?? [];
  const [sendModalRequest, setSendModalRequest] = useState<OfferRequest | null>(
    null,
  );
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);

  async function handleRejectRequest(request: OfferRequest) {
    if (request.id == null) return;
    if (
      !window.confirm(
        "Bu teklif talebini reddetmek istediğinize emin misiniz?",
      )
    ) {
      return;
    }
    setRejectingId(request.id);
    try {
      await rejectVendorOfferRequest(request.id);
      toast.success("Talep reddedildi.");
      await load();
    } catch (e) {
      if (e instanceof ApiError && process.env.NODE_ENV === "development") {
        console.log("Reject offer request failed", e.body);
      }
      toast.error(formatApiErrorMessage(e, "Talep reddedilemedi."));
    } finally {
      setRejectingId(null);
    }
  }

  const pendingCount = offers.filter((o) => isPendingVendorResponse(o.status)).length;

  return (
    <div className={`${glassCard} mb-8`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Gelen Teklif Talepleri</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {pendingCount > 0
              ? `${pendingCount} yanıt bekleyen talep`
              : "Yanıt bekleyen talep yok"}
          </p>
        </div>
        <button
          type="button"
          className={`${btnSecondary} text-xs`}
          onClick={() => void load()}
          disabled={loading || rejectingId != null}
        >
          Yenile
        </button>
      </div>

      <VendorSectionState
        loading={loading}
        error={error}
        onRetry={load}
        isEmpty={!loading && !error && offers.length === 0}
        empty={
          <EmptyState
            icon={EMPTY_STATE_PRESETS.offersVendor.icon}
            title={EMPTY_STATE_PRESETS.offersVendor.title}
            description={EMPTY_STATE_PRESETS.offersVendor.description}
            actionLabel={EMPTY_STATE_PRESETS.offersVendor.actionLabel}
            onAction={() => {
              document
                .getElementById(EMPTY_STATE_PRESETS.offersVendor.sectionId ?? "")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        }
      >
        <ul className="mt-2 space-y-4">
          {offers.map((o) => {
            const canAct = canVendorActOnRequest(o.status) && o.id != null;
            const busy = rejectingId === o.id;

            return (
              <li key={String(o.id)}>
                <OfferRequestCard offer={o} variant="vendor" />
                {canAct ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${btnPrimary} !px-4 !py-2 text-xs`}
                      disabled={busy || rejectingId != null}
                      onClick={() => setSendModalRequest(o)}
                    >
                      Fiyatlı Teklif Gönder
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      disabled={busy || rejectingId != null}
                      onClick={() => handleRejectRequest(o)}
                    >
                      {busy ? "Reddediliyor…" : "Talebi Reddet"}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </VendorSectionState>

      <VendorSendOfferModal
        request={sendModalRequest}
        open={sendModalRequest != null}
        onClose={() => setSendModalRequest(null)}
        onSuccess={() => {
          toast.success("Fiyatlı teklif müşteriye gönderildi.");
          void load();
        }}
      />
    </div>
  );
}
