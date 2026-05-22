import type { OfferRequest } from "@/src/lib/api/types";

const STATUS_LABELS: Record<string, string> = {
  Pending: "Bekliyor",
  Accepted: "Kabul Edildi",
  Rejected: "Reddedildi",
  Expired: "Süresi Doldu",
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  Accepted: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  Rejected: "border-red-400/30 bg-red-500/15 text-red-200",
  Expired: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
};

export function formatOfferStatus(status?: string | null): string {
  if (!status?.trim()) return "Bekliyor";
  const key = status.trim();
  if (STATUS_LABELS[key]) return STATUS_LABELS[key];
  const normalized =
    key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  return STATUS_LABELS[normalized] ?? key;
}

export function getOfferStatusStyle(status?: string | null): string {
  const key = status?.trim() || "Pending";
  return (
    STATUS_STYLES[key] ??
    STATUS_STYLES[
      key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()
    ] ??
    STATUS_STYLES.Pending
  );
}

export function isOfferPending(status?: string | null): boolean {
  const s = (status ?? "Pending").trim().toLowerCase();
  return s === "pending" || s === "bekliyor";
}

export function formatOfferDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const slice = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) return value;
  try {
    return new Date(slice + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return slice;
  }
}

export function offerResponsePrice(offer: OfferRequest): number | undefined {
  return offer.offeredPrice ?? offer.price;
}

export function offerResponseDescription(
  offer: OfferRequest,
): string | undefined {
  return offer.responseDescription ?? offer.description;
}
