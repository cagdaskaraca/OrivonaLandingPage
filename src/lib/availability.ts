import type { VendorAvailability } from "@/src/lib/api/types";

export function formatAvailabilityDate(date?: string): string {
  if (!date) return "—";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function findAvailabilityOnDate(
  list: VendorAvailability[],
  date: string,
): VendorAvailability | undefined {
  return list.find((a) => a.date === date);
}

export function upcomingAvailability(
  list: VendorAvailability[],
  fromDate = new Date(),
): VendorAvailability[] {
  const today = fromDate.toISOString().slice(0, 10);
  return list.filter((a) => a.date && a.date >= today);
}
