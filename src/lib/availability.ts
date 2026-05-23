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

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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

export function availabilityStatusMap(
  list: VendorAvailability[],
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const item of list) {
    if (item.date) map.set(item.date, item.isAvailable !== false);
  }
  return map;
}

export function buildCalendarMonthCells(viewDateIso: string): {
  date: string;
  day: number;
}[] {
  const base = new Date(`${viewDateIso}T12:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; day: number }[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ date: "", day: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: iso, day: d });
  }
  return cells;
}

export function formatCalendarMonthLabel(viewDateIso: string): string {
  const d = new Date(`${viewDateIso}T12:00:00`);
  return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export function shiftMonthIso(viewDateIso: string, delta: number): string {
  const d = new Date(`${viewDateIso}T12:00:00`);
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 10);
}
