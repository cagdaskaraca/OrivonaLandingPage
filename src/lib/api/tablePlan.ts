import {
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
} from "@/src/lib/api/client";
import { recordBool, recordId, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  CreateTablePayload,
  TablePlanData,
  TablePlanGuest,
  TablePlanSeat,
  TablePlanTable,
  TablePlanTableType,
  UpdateTablePayload,
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

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

function normalizeSeat(raw: unknown): TablePlanSeat {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const guestIdRaw = o.guestId ?? o.GuestId;
  const hasGuest = guestIdRaw != null && guestIdRaw !== "";
  return {
    id: recordId(o),
    seatNumber: recordNum(o, "seatNumber", "SeatNumber"),
    guestId: hasGuest ? recordId(o, "guestId", "GuestId") : null,
    guestName: hasGuest
      ? recordStr(o, "guestName", "GuestName") ?? null
      : null,
  };
}

export function normalizeTablePlanTable(raw: unknown): TablePlanTable {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const seatsRaw = o.seats ?? o.Seats;
  const capacity = recordNum(o, "capacity", "Capacity");
  const seats = Array.isArray(seatsRaw)
    ? seatsRaw.map(normalizeSeat)
    : undefined;
  const occupiedFromApi = recordNum(o, "occupiedCount", "OccupiedCount");
  const occupiedCount =
    occupiedFromApi ??
    (seats ? seats.filter((s) => s.guestId != null).length : undefined);
  const emptyFromApi = recordNum(o, "emptyCount", "EmptyCount");
  const emptyCount =
    emptyFromApi ??
    (capacity != null && occupiedCount != null
      ? Math.max(0, capacity - occupiedCount)
      : undefined);

  return {
    id: recordId(o),
    name: recordStr(o, "name", "Name"),
    tableType: recordStr(o, "tableType", "TableType") as TablePlanTableType,
    capacity,
    occupiedCount,
    emptyCount,
    positionX: recordNum(o, "positionX", "PositionX") ?? 0,
    positionY: recordNum(o, "positionY", "PositionY") ?? 0,
    rotation: recordNum(o, "rotation", "Rotation") ?? 0,
    seats,
  };
}

function normalizeTablePlanGuest(raw: unknown): TablePlanGuest {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const assignedTableIdRaw = o.assignedTableId ?? o.AssignedTableId;
  const assignedSeatIdRaw = o.assignedSeatId ?? o.AssignedSeatId;
  return {
    id: recordId(o),
    fullName: recordStr(o, "fullName", "FullName"),
    assignedTableId:
      assignedTableIdRaw === null || assignedTableIdRaw === undefined
        ? null
        : recordId(o, "assignedTableId", "AssignedTableId"),
    assignedTableName:
      recordStr(o, "assignedTableName", "AssignedTableName") ?? null,
    assignedSeatId:
      assignedSeatIdRaw === null || assignedSeatIdRaw === undefined
        ? null
        : recordId(o, "assignedSeatId", "AssignedSeatId"),
    assignedSeatNumber:
      recordNum(o, "assignedSeatNumber", "AssignedSeatNumber") ?? null,
    isAssigned:
      recordBool(o, "isAssigned", "IsAssigned") ??
      assignedTableIdRaw != null,
  };
}

function normalizeTablePlanData(raw: unknown): TablePlanData {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const tablesRaw = o.tables ?? o.Tables;
  const guestsRaw = o.guests ?? o.Guests;
  return {
    eventPlanId:
      recordId(o, "eventPlanId", "EventPlanId") ?? recordId(o),
    tables: Array.isArray(tablesRaw)
      ? tablesRaw.map(normalizeTablePlanTable)
      : [],
    guests: Array.isArray(guestsRaw)
      ? guestsRaw.map(normalizeTablePlanGuest)
      : [],
  };
}

export async function getTablePlan(
  eventPlanId: string | number,
): Promise<TablePlanData> {
  const res = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/table-plan`,
  );
  assertSuccess(res);
  const payload = extractPayload(res.data);
  return normalizeTablePlanData(payload);
}

export async function createTable(
  eventPlanId: string | number,
  payload: CreateTablePayload,
): Promise<TablePlanTable> {
  const res = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/tables`,
    payload,
  );
  assertSuccess(res);
  const payloadData = extractPayload(res.data);
  if (payloadData && typeof payloadData === "object" && !Array.isArray(payloadData)) {
    return normalizeTablePlanTable(payloadData);
  }
  return {};
}

export async function updateTable(
  eventPlanId: string | number,
  tableId: string | number,
  payload: UpdateTablePayload,
): Promise<TablePlanTable> {
  const res = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/tables/${tableId}`,
    payload,
  );
  assertSuccess(res);
  const payloadData = extractPayload(res.data);
  if (payloadData && typeof payloadData === "object" && !Array.isArray(payloadData)) {
    return normalizeTablePlanTable(payloadData);
  }
  return {};
}

export async function assignGuestToSeat(
  eventPlanId: string | number,
  tableId: string | number,
  seatId: string | number,
  guestId: string | number,
): Promise<TablePlanData> {
  const res = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/tables/${tableId}/seats/${seatId}/assign`,
    { guestId },
  );
  assertSuccess(res);
  const payload = extractPayload(res.data);
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (o.tables || o.Tables || o.guests || o.Guests) {
      return normalizeTablePlanData(payload);
    }
  }
  return getTablePlan(eventPlanId);
}

export async function unassignSeat(
  eventPlanId: string | number,
  tableId: string | number,
  seatId: string | number,
): Promise<TablePlanData> {
  const res = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/tables/${tableId}/seats/${seatId}/assign`,
  );
  assertSuccess(res);
  const payload = extractPayload(res.data);
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (o.tables || o.Tables || o.guests || o.Guests) {
      return normalizeTablePlanData(payload);
    }
  }
  return getTablePlan(eventPlanId);
}

export async function deleteTable(
  eventPlanId: string | number,
  tableId: string | number,
): Promise<void> {
  const res = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/tables/${tableId}`,
  );
  assertSuccess(res);
}
