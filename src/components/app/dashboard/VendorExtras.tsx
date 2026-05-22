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
  updateServiceImage,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  DashboardSummary,
  Reservation,
  ServiceImage,
  VendorService,
} from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import { btnPrimary, btnSecondary, glassCard, inputClass, skeletonClass } from "@/src/lib/ui";

export function VendorSummaryCards() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDashboardSummary()
      .then(setSummary)
      .catch((e) => {
        if (e instanceof ApiError) console.log("Vendor summary failed", e.body);
        setSummary({});
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SummaryCards
      summary={summary}
      loading={loading}
      className="mb-6"
      emptyMessage=""
    />
  );
}

export function VendorReservationsPanel() {
  const toast = useToast();
  const [list, setList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setList(await fetchVendorReservations());
    } catch (e) {
      if (e instanceof ApiError) console.log("Vendor reservations failed", e.body);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={`${glassCard} mb-8`}>
      <h2 className="text-lg font-semibold text-white">Rezervasyonlar</h2>
      {loading ? (
        <p className="mt-2 text-sm text-zinc-500">Yükleniyor…</p>
      ) : list.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">Rezervasyon yok.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {list.map((r) => (
            <li
              key={String(r.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <div>
                <p className="font-medium text-white">{r.serviceTitle ?? "—"}</p>
                <p className="text-zinc-400">
                  {r.customerName} · {r.eventDate} · {r.status}
                </p>
              </div>
              {r.id != null ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs`}
                    onClick={async () => {
                      try {
                        await confirmVendorReservation(r.id!);
                        toast.success("Onaylandı.");
                        load();
                      } catch (e) {
                        toast.error(formatApiErrorMessage(e, "Onaylanamadı."));
                      }
                    }}
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs`}
                    onClick={async () => {
                      try {
                        await completeVendorReservation(r.id!);
                        toast.success("Tamamlandı.");
                        load();
                      } catch (e) {
                        toast.error(formatApiErrorMessage(e, "Tamamlanamadı."));
                      }
                    }}
                  >
                    Tamamla
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
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
