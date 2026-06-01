import { boardStatusLabel } from "@/src/lib/premiumLabels";

export function formatBoardPrice(price: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(price)} TL`;
}

export function formatBoardDate(iso: string | undefined): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function boardItemStatusBadge(status: string | undefined): string {
  return boardStatusLabel(status);
}

export function boardColumnHeading(title: string | undefined, count: number): string {
  const label = (title ?? "").trim().toUpperCase() || "KOLON";
  return `${label} (${count})`;
}
