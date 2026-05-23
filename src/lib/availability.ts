import type { VendorAvailability } from "@/src/lib/api/types";

export type AvailabilityMapEntry = {
  isAvailable: boolean;
  status?: string;
  note?: string;
  id?: string | number;
};

export type AvailabilityTimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const UNAVAILABLE_STATUSES = new Set([
  "unavailable",
  "full",
  "dolu",
  "busy",
  "closed",
  "kapali",
  "kapalı",
]);

const AVAILABLE_STATUSES = new Set([
  "available",
  "müsait",
  "musait",
  "open",
  "acik",
  "açık",
]);

/** Normalize any API date to calendar key YYYY-MM-DD (UTC-safe for ISO strings). */
export function toDateKey(raw?: string | null): string | undefined {
  if (raw == null || raw === "") return undefined;
  const s = String(raw).trim();
  const slice = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseBoolLike(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
}

function statusToAvailable(status?: string): boolean | undefined {
  if (!status?.trim()) return undefined;
  const s = status.trim().toLowerCase();
  if (UNAVAILABLE_STATUSES.has(s)) return false;
  if (AVAILABLE_STATUSES.has(s)) return true;
  return undefined;
}

/** Whether an availability row means müsait (false = dolu). */
export function isAvailabilityEntryAvailable(
  item: VendorAvailability,
): boolean {
  const fromBool = parseBoolLike(item.isAvailable);
  const fromStatus = statusToAvailable(item.status);

  if (fromBool === false) return false;
  if (fromStatus === false) return false;
  if (fromBool === true) return true;
  if (fromStatus === true) return true;
  return false;
}

/**
 * Flattens GET availability payloads: { months: [{ days: [...] }] } or nested data.data.months.
 * Also accepts a legacy flat day array.
 */
export function flattenAvailabilityPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  const inner = obj.data ?? obj.Data;
  if (inner != null && inner !== data && typeof inner === "object") {
    const fromInner = flattenAvailabilityPayload(inner);
    if (fromInner.length > 0) return fromInner;
  }

  const months = obj.months ?? obj.Months;
  if (Array.isArray(months)) {
    const days: unknown[] = [];
    for (const month of months) {
      if (!month || typeof month !== "object") continue;
      const m = month as Record<string, unknown>;
      const monthDays = m.days ?? m.Days;
      if (Array.isArray(monthDays)) days.push(...monthDays);
    }
    return days;
  }

  for (const key of ["availability", "items", "days", "Days"]) {
    const arr = obj[key];
    if (Array.isArray(arr)) return arr as unknown[];
  }
  return [];
}

/** YYYY-MM-DD -> müsaitlik row from normalized list. */
export function buildAvailabilityMap(
  list: VendorAvailability[],
): Map<string, AvailabilityMapEntry> {
  const map = new Map<string, AvailabilityMapEntry>();
  for (const item of list) {
    const key = toDateKey(item.date);
    if (!key) continue;
    map.set(key, {
      isAvailable: isAvailabilityEntryAvailable(item),
      status: item.status,
      note: item.notes,
      id: item.id,
    });
  }
  return map;
}

export function formatAvailabilityDate(date?: string): string {
  const key = toDateKey(date);
  if (!key) return "—";
  const d = new Date(`${key}T12:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** dd.MM.yyyy for registered-date list */
export function formatShortAvailabilityDate(date?: string): string {
  const key = toDateKey(date);
  if (!key) return "—";
  const [y, m, d] = key.split("-");
  return `${d}.${m}.${y}`;
}

export function availabilityStatusLabel(item: VendorAvailability): string {
  return isAvailabilityEntryAvailable(item) ? "Müsait" : "Dolu";
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function findAvailabilityOnDate(
  list: VendorAvailability[],
  date: string,
): VendorAvailability | undefined {
  const key = toDateKey(date);
  if (!key) return undefined;
  return list.find((a) => toDateKey(a.date) === key);
}

export function upcomingAvailability(
  list: VendorAvailability[],
  fromDate = new Date(),
): VendorAvailability[] {
  const today = fromDate.toISOString().slice(0, 10);
  return list.filter((a) => {
    const key = toDateKey(a.date);
    return key && key >= today;
  });
}

/** date ISO key -> true müsait, false dolu. Only dates with saved rows. */
export function availabilityStatusMap(
  list: VendorAvailability[],
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const [key, entry] of buildAvailabilityMap(list)) {
    map.set(key, entry.isAvailable);
  }
  return map;
}

export function getAvailabilityMapEntry(
  list: VendorAvailability[],
  date: string,
): AvailabilityMapEntry | undefined {
  const item = findAvailabilityOnDate(list, date);
  if (!item) return undefined;
  return {
    isAvailable: isAvailabilityEntryAvailable(item),
    status: item.status,
    note: item.notes,
    id: item.id,
  };
}

export function mergeAvailabilityItem(
  list: VendorAvailability[],
  item: VendorAvailability,
): VendorAvailability[] {
  const key = toDateKey(item.date);
  if (!key) return list;
  const next = list.filter((a) => toDateKey(a.date) !== key);
  next.push({ ...item, date: key });
  return next.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

export function buildCalendarMonthCells(viewDateIso: string): {
  date: string;
  day: number;
}[] {
  const key = toDateKey(viewDateIso) ?? viewDateIso;
  const base = new Date(`${key}T12:00:00`);
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
  const key = toDateKey(viewDateIso) ?? viewDateIso;
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export function shiftMonthIso(viewDateIso: string, delta: number): string {
  const key = toDateKey(viewDateIso) ?? viewDateIso;
  const d = new Date(`${key}T12:00:00`);
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 10);
}

export function newTimeSlot(
  partial?: Partial<AvailabilityTimeSlot>,
): AvailabilityTimeSlot {
  return {
    id:
      partial?.id ??
      `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startTime: partial?.startTime ?? "10:00",
    endTime: partial?.endTime ?? "12:00",
    isAvailable: partial?.isAvailable ?? true,
  };
}
