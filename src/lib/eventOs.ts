import type { EventPlan, EventTask, EventTaskStatus } from "@/src/lib/api/types";

export const EVENT_TASK_STATUSES: {
  value: EventTaskStatus;
  label: string;
}[] = [
  { value: "Todo", label: "Yapılacak" },
  { value: "InProgress", label: "Devam" },
  { value: "Done", label: "Tamam" },
  { value: "Skipped", label: "Atlandı" },
];

export const RSVP_STATUS_OPTIONS = [
  { value: "Pending", label: "Bekliyor" },
  { value: "Accepted", label: "Katılıyor" },
  { value: "Declined", label: "Katılmıyor" },
  { value: "Maybe", label: "Kararsız" },
] as const;

/** Map API/legacy RSVP values to form select value. */
export function normalizeGuestRsvpForForm(status?: string): string {
  const s = status?.trim().toLowerCase() ?? "";
  if (s === "pending" || s === "bekliyor" || s === "waiting") return "Pending";
  if (
    s === "accepted" ||
    s === "attending" ||
    s === "yes" ||
    s === "katılıyor" ||
    s === "katiliyor"
  ) {
    return "Accepted";
  }
  if (
    s === "declined" ||
    s === "notattending" ||
    s === "no" ||
    s === "katılmıyor" ||
    s === "katilmiyor"
  ) {
    return "Declined";
  }
  if (s === "maybe" || s === "kararsız" || s === "kararsiz" || s === "uncertain") {
    return "Maybe";
  }
  return "Pending";
}

/** Send only Pending | Accepted | Declined | Maybe to API. */
export function mapGuestRsvpToApi(status?: string): string {
  const key = normalizeGuestRsvpForForm(status);
  return key;
}

export function normalizeTaskStatus(raw?: string): EventTaskStatus {
  const s = raw?.trim();
  if (s === "InProgress" || s === "inprogress" || s === "In Progress") {
    return "InProgress";
  }
  if (s === "Done" || s === "done" || s === "Completed") return "Done";
  if (s === "Skipped" || s === "skipped") return "Skipped";
  return "Todo";
}

export function taskProgressPercent(
  tasks: EventTask[],
  plan?: EventPlan | null,
): number {
  if (plan?.progressPercent != null && !Number.isNaN(plan.progressPercent)) {
    return Math.min(100, Math.max(0, Math.round(plan.progressPercent)));
  }
  if (tasks.length === 0) return 0;
  const done = tasks.filter(
    (t) =>
      normalizeTaskStatus(t.status) === "Done" ||
      normalizeTaskStatus(t.status) === "Skipped",
  ).length;
  return Math.round((done / tasks.length) * 100);
}

export function rsvpStatusLabel(status?: string): string {
  const s = status?.trim().toLowerCase();
  if (!s) return "Bekliyor";
  if (
    s === "attending" ||
    s === "yes" ||
    s === "accepted" ||
    s === "katılıyor" ||
    s === "katiliyor"
  ) {
    return "Katılıyor";
  }
  if (
    s === "notattending" ||
    s === "declined" ||
    s === "no" ||
    s === "katılmıyor" ||
    s === "katilmiyor"
  ) {
    return "Katılmıyor";
  }
  if (s === "maybe" || s === "uncertain" || s === "kararsız" || s === "kararsiz") {
    return "Kararsız";
  }
  return "Bekliyor";
}

export function defaultEventPlanForm() {
  return {
    title: "",
    eventType: "Düğün",
    eventDate: "",
    city: "İstanbul",
    district: "",
    guestCount: 100,
    budgetMin: 100000,
    budgetMax: 300000,
    notes: "",
  };
}

export function planDisplayTitle(plan: EventPlan): string {
  return plan.title?.trim() || plan.eventType?.trim() || "Etkinlik planı";
}
