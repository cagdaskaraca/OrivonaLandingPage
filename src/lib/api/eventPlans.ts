import {
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
} from "@/src/lib/api/client";
import { mapGuestRsvpToApi } from "@/src/lib/eventOs";
import { recordBool, recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  EventGuest,
  EventGuestFormPayload,
  EventPlan,
  EventPlanFormPayload,
  EventReminder,
  EventTask,
  EventTaskFormPayload,
  QrInvite,
  RsvpSummary,
  SeatingTable,
  SeatingTableFormPayload,
} from "@/src/lib/api/types";

function assertSuccess(envelope: ApiEnvelope): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "data",
      "plans",
      "tasks",
      "guests",
      "tables",
      "reminders",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

export function normalizeEventPlan(raw: unknown): EventPlan {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    title: recordStr(o, "title", "Title"),
    eventType: recordStr(o, "eventType", "EventType"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    guestCount: recordNum(o, "guestCount", "GuestCount"),
    budgetMin: recordNum(o, "budgetMin", "BudgetMin"),
    budgetMax: recordNum(o, "budgetMax", "BudgetMax"),
    notes: recordStr(o, "notes", "Notes"),
    status: recordStr(o, "status", "Status"),
    progressPercent:
      recordNum(o, "progressPercent", "ProgressPercent") ??
      recordNum(o, "progress", "Progress"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

export function normalizeEventTask(raw: unknown): EventTask {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    title: recordStr(o, "title", "Title"),
    description: recordStr(o, "description", "Description"),
    status: recordStr(o, "status", "Status") ?? "Todo",
    categoryName:
      recordStr(o, "categoryName", "CategoryName") ??
      recordStr(o, "category", "Category"),
    priority: recordStr(o, "priority", "Priority"),
    dueDate:
      recordStr(o, "dueDate", "DueDate") ??
      recordStr(o, "dueAt", "DueAt"),
    sortOrder: recordNum(o, "sortOrder", "SortOrder"),
  };
}

export function normalizeEventGuest(raw: unknown): EventGuest {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const fullName =
    recordStr(o, "fullName", "FullName") ?? recordStr(o, "name", "Name");
  const groupName =
    recordStr(o, "groupName", "GroupName") ?? recordStr(o, "group", "Group");
  const note =
    recordStr(o, "note", "Note") ?? recordStr(o, "notes", "Notes");
  return {
    id: recordId(o),
    fullName,
    name: fullName,
    email: recordStr(o, "email", "Email"),
    phone: recordStr(o, "phone", "Phone"),
    groupName,
    group: groupName,
    rsvpStatus:
      recordStr(o, "rsvpStatus", "RsvpStatus") ??
      recordStr(o, "status", "Status"),
    plusOneCount:
      recordNum(o, "plusOneCount", "PlusOneCount") ??
      recordNum(o, "plusOnes", "PlusOnes"),
    tableId:
      recordId(o, "tableId", "TableId") ??
      recordId(o, "seatingTableId", "SeatingTableId"),
    tableName:
      recordStr(o, "tableName", "TableName") ??
      recordStr(o, "assignedTableName", "AssignedTableName"),
    note,
    notes: note,
    inviteSent:
      recordBool(o, "inviteSent", "InviteSent") ??
      recordBool(o, "isInviteSent", "IsInviteSent"),
    isInviteSent: recordBool(o, "isInviteSent", "IsInviteSent"),
    ticketSent:
      recordBool(o, "ticketSent", "TicketSent") ??
      recordBool(o, "isTicketSent", "IsTicketSent"),
    isTicketSent: recordBool(o, "isTicketSent", "IsTicketSent"),
    respondedAt:
      recordStr(o, "respondedAt", "RespondedAt") ??
      recordStr(o, "rsvpRespondedAt", "RsvpRespondedAt"),
    rsvpRespondedAt: recordStr(o, "rsvpRespondedAt", "RsvpRespondedAt"),
  };
}

export function normalizeRsvpSummary(raw: unknown): RsvpSummary {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    total:
      recordNum(o, "total", "Total") ??
      recordNum(o, "totalGuests", "TotalGuests"),
    attending:
      recordNum(o, "attending", "Attending") ??
      recordNum(o, "yes", "Yes") ??
      recordNum(o, "accepted", "Accepted"),
    notAttending:
      recordNum(o, "notAttending", "NotAttending") ??
      recordNum(o, "declined", "Declined") ??
      recordNum(o, "no", "No"),
    maybe:
      recordNum(o, "maybe", "Maybe") ??
      recordNum(o, "uncertain", "Uncertain"),
    pending:
      recordNum(o, "pending", "Pending") ??
      recordNum(o, "waiting", "Waiting"),
  };
}

export function normalizeSeatingTable(raw: unknown): SeatingTable {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const guestsRaw = o.guests ?? o.Guests ?? o.assignedGuests ?? o.AssignedGuests;
  return {
    id: recordId(o),
    name: recordStr(o, "name", "Name") ?? recordStr(o, "tableName", "TableName"),
    capacity: recordNum(o, "capacity", "Capacity"),
    guests: Array.isArray(guestsRaw)
      ? guestsRaw.map(normalizeEventGuest)
      : undefined,
    assignedGuestIds: Array.isArray(o.assignedGuestIds)
      ? (o.assignedGuestIds as (string | number)[])
      : undefined,
  };
}

export function normalizeReminder(raw: unknown): EventReminder {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    title: recordStr(o, "title", "Title"),
    message:
      recordStr(o, "message", "Message") ??
      recordStr(o, "description", "Description"),
    description: recordStr(o, "description", "Description"),
    dueDate:
      recordStr(o, "dueDate", "DueDate") ??
      recordStr(o, "scheduledAt", "ScheduledAt"),
    scheduledAt: recordStr(o, "scheduledAt", "ScheduledAt"),
    type: recordStr(o, "type", "Type"),
    channel: recordStr(o, "channel", "Channel"),
  };
}

export function normalizeQrInvite(raw: unknown): QrInvite {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    inviteUrl:
      recordStr(o, "inviteUrl", "InviteUrl") ??
      recordStr(o, "url", "Url"),
    qrCodeUrl:
      recordStr(o, "qrCodeUrl", "QrCodeUrl") ??
      recordStr(o, "qrImageUrl", "QrImageUrl"),
    message: recordStr(o, "message", "Message"),
    demoText:
      recordStr(o, "demoText", "DemoText") ??
      recordStr(o, "qrDemoText", "QrDemoText"),
  };
}

function buildPlanBody(payload: EventPlanFormPayload): Record<string, unknown> {
  return {
    title: payload.title.trim(),
    eventType: payload.eventType.trim(),
    eventDate: payload.eventDate || undefined,
    city: payload.city.trim(),
    district: payload.district.trim(),
    guestCount: payload.guestCount,
    budgetMin: payload.budgetMin,
    budgetMax: payload.budgetMax,
    notes: payload.notes?.trim() ?? "",
  };
}

function buildTaskBody(payload: EventTaskFormPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    description: payload.description?.trim() ?? "",
    status: payload.status ?? "Todo",
    categoryName: payload.categoryName?.trim() ?? "",
    priority: payload.priority?.trim() ?? "",
  };
  if (payload.dueDate?.trim()) {
    body.dueDate = payload.dueDate.trim();
  }
  return body;
}

/** Full PUT body when backend requires title and related fields on status update. */
export function buildTaskUpdateFromExisting(
  task: EventTask,
  overrides: Partial<EventTaskFormPayload> = {},
): EventTaskFormPayload {
  const title = (overrides.title ?? task.title ?? "").trim();
  if (!title) {
    throw new Error("Görev başlığı boş olamaz.");
  }
  return {
    title,
    description: overrides.description ?? task.description ?? "",
    categoryName: overrides.categoryName ?? task.categoryName ?? "",
    priority: overrides.priority ?? task.priority ?? "",
    dueDate: overrides.dueDate ?? task.dueDate ?? "",
    status: overrides.status ?? (task.status as EventTaskFormPayload["status"]) ?? "Todo",
  };
}

function buildGuestBody(payload: EventGuestFormPayload): Record<string, unknown> {
  return {
    fullName: payload.fullName.trim(),
    email: payload.email?.trim() ?? "",
    phone: payload.phone?.trim() ?? "",
    groupName: payload.groupName?.trim() ?? "",
    note: payload.note?.trim() ?? "",
    plusOneCount: payload.plusOneCount ?? 0,
    rsvpStatus: mapGuestRsvpToApi(payload.rsvpStatus),
  };
}

// ——— Event plans ———

export async function fetchMyEventPlans(): Promise<EventPlan[]> {
  const body = await apiGetRaw<ApiEnvelope>("/event-plans/my");
  assertSuccess(body);
  return toList(extractPayload(body.data))
    .map(normalizeEventPlan)
    .filter((p) => p.id != null);
}

export async function fetchEventPlanById(
  id: string | number,
): Promise<EventPlan> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${id}`);
  assertSuccess(body);
  const payload = extractPayload(body.data);
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return normalizeEventPlan(payload);
  }
  return normalizeEventPlan(body.data);
}

export async function createEventPlan(
  payload: EventPlanFormPayload,
): Promise<EventPlan> {
  const body = await apiPostRaw<ApiEnvelope>(
    "/event-plans",
    buildPlanBody(payload),
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeEventPlan(data);
  }
  return normalizeEventPlan(body.data);
}

export async function updateEventPlan(
  id: string | number,
  payload: EventPlanFormPayload,
): Promise<EventPlan> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${id}`,
    buildPlanBody(payload),
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeEventPlan(data);
  }
  return normalizeEventPlan(body.data);
}

export async function deleteEventPlan(id: string | number): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/event-plans/${id}`);
  assertSuccess(body);
}

// ——— Tasks ———

export async function fetchEventPlanTasks(
  planId: string | number,
): Promise<EventTask[]> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${planId}/tasks`);
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeEventTask);
}

export async function createEventPlanTask(
  planId: string | number,
  payload: EventTaskFormPayload,
): Promise<EventTask> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/tasks`,
    buildTaskBody(payload),
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeEventTask(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function updateEventPlanTask(
  planId: string | number,
  taskId: string | number,
  payload: EventTaskFormPayload,
): Promise<EventTask> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${planId}/tasks/${taskId}`,
    buildTaskBody(payload),
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeEventTask(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function deleteEventPlanTask(
  planId: string | number,
  taskId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${planId}/tasks/${taskId}`,
  );
  assertSuccess(body);
}

export async function generateEventPlanTasks(
  planId: string | number,
): Promise<EventTask[]> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/tasks/generate`,
    {},
  );
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeEventTask);
}

// ——— Guests ———

export async function fetchEventPlanGuests(
  planId: string | number,
): Promise<EventGuest[]> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${planId}/guests`);
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeEventGuest);
}

export async function createEventPlanGuest(
  planId: string | number,
  payload: EventGuestFormPayload,
): Promise<EventGuest> {
  const requestBody = buildGuestBody(payload);
  console.log("Guest payload", requestBody);
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests`,
    requestBody,
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeEventGuest(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function updateEventPlanGuest(
  planId: string | number,
  guestId: string | number,
  payload: EventGuestFormPayload,
): Promise<EventGuest> {
  const requestBody = buildGuestBody(payload);
  console.log("Guest payload", requestBody);
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/${guestId}`,
    requestBody,
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeEventGuest(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function deleteEventPlanGuest(
  planId: string | number,
  guestId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/${guestId}`,
  );
  assertSuccess(body);
}

export async function importDemoEventPlanGuests(
  planId: string | number,
): Promise<EventGuest[]> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/import-demo`,
    {},
  );
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeEventGuest);
}

export async function updateGuestRsvp(
  planId: string | number,
  guestId: string | number,
  rsvpStatus: string,
): Promise<EventGuest> {
  const mapped = mapGuestRsvpToApi(rsvpStatus);
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/${guestId}/rsvp`,
    { rsvpStatus: mapped },
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeEventGuest(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function fetchRsvpSummary(
  planId: string | number,
): Promise<RsvpSummary> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${planId}/rsvp-summary`,
  );
  assertSuccess(body);
  const payload = extractPayload(body.data);
  return normalizeRsvpSummary(payload ?? body.data);
}

// ——— QR ———

export async function fetchQrInvite(planId: string | number): Promise<QrInvite> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${planId}/qr-invite`);
  assertSuccess(body);
  const payload = extractPayload(body.data);
  return normalizeQrInvite(payload ?? body.data);
}

// ——— Seating ———

export async function fetchEventPlanSeating(
  planId: string | number,
): Promise<SeatingTable[]> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${planId}/seating`);
  assertSuccess(body);
  const payload = extractPayload(body.data);
  if (Array.isArray(payload)) {
    return payload.map(normalizeSeatingTable);
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const tables = o.tables ?? o.Tables;
    if (Array.isArray(tables)) return tables.map(normalizeSeatingTable);
  }
  return toList(body.data).map(normalizeSeatingTable);
}

export async function createSeatingTable(
  planId: string | number,
  payload: SeatingTableFormPayload,
): Promise<SeatingTable> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/seating/tables`,
    { name: payload.name.trim(), capacity: payload.capacity },
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeSeatingTable(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function updateSeatingTable(
  planId: string | number,
  tableId: string | number,
  payload: SeatingTableFormPayload,
): Promise<SeatingTable> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${planId}/seating/tables/${tableId}`,
    { name: payload.name.trim(), capacity: payload.capacity },
  );
  assertSuccess(body);
  const data = extractPayload(body.data);
  return normalizeSeatingTable(
    data && typeof data === "object" ? data : body.data,
  );
}

export async function deleteSeatingTable(
  planId: string | number,
  tableId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${planId}/seating/tables/${tableId}`,
  );
  assertSuccess(body);
}

export async function assignGuestToTable(
  planId: string | number,
  guestId: string | number,
  tableId: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/seating/assign`,
    { guestId, tableId },
  );
  assertSuccess(body);
}

// ——— Reminders ———

export async function fetchEventPlanReminders(
  planId: string | number,
): Promise<EventReminder[]> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${planId}/reminders`);
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeReminder);
}

export async function generateEventPlanReminders(
  planId: string | number,
): Promise<EventReminder[]> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/reminders/generate`,
    {},
  );
  assertSuccess(body);
  return toList(extractPayload(body.data)).map(normalizeReminder);
}
