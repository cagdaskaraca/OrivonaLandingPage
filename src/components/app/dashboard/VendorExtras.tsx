"use client";

import { useEffect, useState } from "react";
import {
  addServiceImage,
  completeVendorReservation,
  confirmVendorReservation,
  deleteServiceImage,
  fetchServiceImages,
  fetchVendorDashboardSummary,
  fetchVendorReservations,
  rejectVendorReservation,
  updateServiceImage,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  Reservation,
  ServiceImage,
  VendorService,
} from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { EMPTY_STATE_PRESETS } from "@/src/lib/helpContent";
import { formatOfferDate } from "@/src/lib/offerRequest";
import { OfferPriceBreakdown } from "@/src/components/offers/OfferPriceBreakdown";
import {
  canVendorCompleteReservation,
  canVendorConfirmReservation,
  canVendorRejectReservation,
  reservationActionId,
  reservationPricingInput,
  vendorReservationActionHint,
} from "@/src/lib/reservationUi";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";
import { btnPrimary, btnSecondary, glassCard, inputClass, skeletonClass } from "@/src/lib/ui";

export function VendorSummaryCards() {
  const { data: summary, loading } = useVendorSectionLoad(
    fetchVendorDashboardSummary,
  );

  return (
    <SummaryCards
      summary={summary ?? {}}
      loading={loading}
      className="mb-6"
      emptyMessage=""
    />
  );
}

export function VendorReservationsPanel() {
  const toast = useToast();
  const {
    data,
    loading,
    error,
    reload: load,
  } = useVendorSectionLoad(fetchVendorReservations);
  const list = data ?? [];

  return (
    <div className={`${glassCard} mb-8`}>
      <h2 className="text-lg font-semibold text-white">Rezervasyonlar</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Müşteri teklifi kabul ettiğinde rezervasyon talebi oluşur. «Onayla» ile
        müşterinin ödemesine izin verirsiniz; uygun değilse «Reddet». Etkinlik
        sonrası «Tamamla» ile kapatırsınız.
      </p>
      <VendorSectionState
        loading={loading}
        error={error}
        onRetry={load}
        isEmpty={!loading && !error && list.length === 0}
        empty={
          <div className="mt-4">
            <EmptyState
              icon={EMPTY_STATE_PRESETS.reservationsVendor.icon}
              title={EMPTY_STATE_PRESETS.reservationsVendor.title}
              description={EMPTY_STATE_PRESETS.reservationsVendor.description}
              actionLabel={EMPTY_STATE_PRESETS.reservationsVendor.actionLabel}
              onAction={() => {
                document
                  .getElementById(
                    EMPTY_STATE_PRESETS.reservationsVendor.sectionId ?? "",
                  )
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        }
      >
        <DashboardPaginatedList
          className="mt-4"
          items={list}
          listClassName="space-y-2"
          searchPlaceholder="Rezervasyon ara…"
          filterItem={(r, query) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const hay = [r.serviceTitle, r.customerName, r.eventDate, r.status]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          }}
          getItemKey={(r) => String(reservationActionId(r) ?? r.serviceTitle)}
          renderItem={(r) => {
            const actionId = reservationActionId(r);
            const showConfirm = canVendorConfirmReservation(r.status);
            const showReject = canVendorRejectReservation(r.status);
            const showComplete = canVendorCompleteReservation(r.status);
            const hint = vendorReservationActionHint(r.status);
            const dateLabel = formatOfferDate(r.eventDate) || r.eventDate;
            const hasActions =
              actionId != null && (showConfirm || showReject || showComplete);

            return (
              <div className="rounded-lg border border-white/10 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">
                      {r.serviceTitle ?? "—"}
                    </p>
                    <p className="text-zinc-400">
                      {r.customerName ?? "Müşteri"}
                      {dateLabel ? ` · ${dateLabel}` : ""}
                    </p>
                    {r.status ? (
                      <div className="mt-1.5">
                        <StatusBadge status={r.status} context="vendor" />
                      </div>
                    ) : null}
                    <div className="mt-2">
                      <OfferPriceBreakdown
                        pricing={reservationPricingInput(r)}
                        size="sm"
                      />
                    </div>
                  </div>
                  {hasActions ? (
                    <div className="flex flex-wrap gap-2">
                      {showConfirm ? (
                        <button
                          type="button"
                          className={`${btnPrimary} text-xs`}
                          onClick={async () => {
                            try {
                              await confirmVendorReservation(actionId!);
                              toast.success(
                                "Rezervasyon onaylandı. Müşteri ödeme yapabilir.",
                              );
                              load();
                            } catch (e) {
                              toast.error(
                                formatApiErrorMessage(
                                  e,
                                  "Rezervasyon onaylanamadı. Kayıt iptal edilmiş veya zaten onaylı olabilir.",
                                ),
                              );
                            }
                          }}
                        >
                          Onayla
                        </button>
                      ) : null}
                      {showReject ? (
                        <button
                          type="button"
                          className={`${btnSecondary} text-xs text-rose-300 hover:text-rose-200`}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Bu rezervasyon talebini reddetmek istediğinize emin misiniz?",
                              )
                            ) {
                              return;
                            }
                            try {
                              await rejectVendorReservation(actionId!);
                              toast.success("Rezervasyon reddedildi.");
                              load();
                            } catch (e) {
                              toast.error(
                                formatApiErrorMessage(
                                  e,
                                  "Rezervasyon reddedilemedi. API uç noktası henüz aktif olmayabilir.",
                                ),
                              );
                            }
                          }}
                        >
                          Reddet
                        </button>
                      ) : null}
                      {showComplete ? (
                        <button
                          type="button"
                          className={`${btnSecondary} text-xs`}
                          onClick={async () => {
                            try {
                              await completeVendorReservation(actionId!);
                              toast.success("Rezervasyon tamamlandı.");
                              load();
                            } catch (e) {
                              toast.error(
                                formatApiErrorMessage(
                                  e,
                                  "Rezervasyon tamamlanamadı. Önce onaylanmış olmalıdır.",
                                ),
                              );
                            }
                          }}
                        >
                          Tamamla
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {actionId == null ? (
                  <p className="mt-2 text-xs text-amber-400/90">
                    Rezervasyon kimliği alınamadı; onay/red işlemi yapılamıyor.
                  </p>
                ) : null}
                {hint ? (
                  <p className="mt-2 text-xs text-zinc-500">{hint}</p>
                ) : null}
              </div>
            );
          }}
        />
      </VendorSectionState>
    </div>
  );
}

export function ServiceImageManager({
  service,
}: {
  service: VendorService | null;
}) {
  const toast = useToast();
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const serviceId = service?.id;

  async function load() {
    if (serviceId == null) return;
    setLoading(true);
    try {
      setImages(await fetchServiceImages(serviceId));
    } catch (e) {
      if (e instanceof ApiError) console.log("Service images failed", e.body);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [serviceId]);

  if (serviceId == null) return null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (serviceId == null || !url.trim()) return;
    try {
      await addServiceImage(serviceId, {
        url: url.trim(),
        isCover: images.length === 0,
      });
      setUrl("");
      toast.success("Görsel eklendi.");
      load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Görsel eklenemedi."));
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <h3 className="text-sm font-semibold text-violet-100">Hizmet görselleri (URL)</h3>
      <form onSubmit={handleAdd} className="mt-2 flex gap-2">
        <input
          className={inputClass}
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" className={btnSecondary}>
          Ekle
        </button>
      </form>
      {loading ? (
        <p className="mt-2 text-xs text-zinc-500">Yükleniyor…</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={String(img.id)}
              className="relative w-24 overflow-hidden rounded-lg border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? img.imageUrl}
                alt=""
                className="h-16 w-full object-cover"
              />
              <div className="flex gap-1 p-1">
                {!img.isCover && img.id != null ? (
                  <button
                    type="button"
                    className="text-[10px] text-violet-300"
                    onClick={async () => {
                      await updateServiceImage(serviceId, img.id!, {
                        url: img.url ?? img.imageUrl ?? "",
                        isCover: true,
                      });
                      load();
                    }}
                  >
                    Kapak
                  </button>
                ) : null}
                {img.id != null ? (
                  <button
                    type="button"
                    className="text-[10px] text-red-300"
                    onClick={async () => {
                      await deleteServiceImage(serviceId, img.id!);
                      load();
                    }}
                  >
                    Sil
                  </button>
                ) : null}
              </div>
              {img.isCover ? (
                <span className="absolute left-1 top-1 rounded bg-violet-600/80 px-1 text-[9px]">
                  Kapak
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
