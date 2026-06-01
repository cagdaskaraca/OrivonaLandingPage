"use client";

import { useCallback, useEffect, useState } from "react";
import { AddTableModal } from "@/src/components/event-os/table-plan/AddTableModal";
import { AssignGuestModal } from "@/src/components/event-os/table-plan/AssignGuestModal";
import { GuestSeatingList } from "@/src/components/event-os/table-plan/GuestSeatingList";
import { TablePlanCanvas } from "@/src/components/event-os/table-plan/TablePlanCanvas";
import { TablePlanTemplatePanel } from "@/src/components/event-os/table-plan/TablePlanTemplatePanel";
import {
  EventOsError,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  assignGuestToSeat,
  createTable,
  deleteTable,
  getTablePlan,
  unassignSeat,
  updateTable,
} from "@/src/lib/api/tablePlan";
import type {
  TablePlanData,
  TablePlanGuest,
  TablePlanSeat,
  TablePlanTable,
  TablePlanTableType,
} from "@/src/lib/api/types";
import {
  defaultNewTablePosition,
  tableTypeHasSeats,
  tableTypeLabel,
} from "@/src/lib/tablePlan/helpers";
import { btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

type EventOsTablePlanViewProps = {
  planId: string | number;
};

type SeatTarget = {
  table: TablePlanTable;
  seat: TablePlanSeat;
};

export function EventOsTablePlanView({ planId }: EventOsTablePlanViewProps) {
  const [data, setData] = useState<TablePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<
    string | number | null
  >(null);
  const [zoom, setZoom] = useState(1);
  const [dragPositions, setDragPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const [addType, setAddType] = useState<TablePlanTableType | null>(null);
  const [seatTarget, setSeatTarget] = useState<SeatTarget | null>(null);
  const [renameName, setRenameName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await getTablePlan(planId);
      setData(plan);
      setDragPositions({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Masa planı yüklenemedi.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
    setSelectedTableId(null);
  }, [load]);

  const tables = data?.tables ?? [];
  const guests = data?.guests ?? [];
  const selectedTable =
    tables.find((t) => String(t.id) === String(selectedTableId)) ?? null;

  useEffect(() => {
    setRenameName(selectedTable?.name ?? "");
  }, [selectedTable?.id, selectedTable?.name]);

  const defaultTableName = (type: TablePlanTableType) => {
    const sameType = tables.filter((t) => t.tableType === type).length;
    const prefix =
      type === "Stage"
        ? "Sahne"
        : type === "DanceFloor"
          ? "Dans alanı"
          : type === "CustomArea"
            ? "Özel alan"
            : "Masa";
    return `${prefix} ${sameType + 1}`;
  };

  const handleCreateTable = async (name: string) => {
    if (!addType) return;
    setBusy(true);
    try {
      const pos = defaultNewTablePosition(tables.length);
      await createTable(planId, {
        name,
        tableType: addType,
        positionX: pos.positionX,
        positionY: pos.positionY,
        rotation: 0,
      });
      setAddType(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Masa eklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDragMove = (tableId: string | number, x: number, y: number) => {
    setDragPositions((prev) => ({
      ...prev,
      [String(tableId)]: { x, y },
    }));
  };

  const handleDragEnd = async (
    tableId: string | number,
    x: number,
    y: number,
  ) => {
    const table = tables.find((t) => String(t.id) === String(tableId));
    if (!table?.name) {
      setDragPositions((prev) => {
        const next = { ...prev };
        delete next[String(tableId)];
        return next;
      });
      return;
    }
    setBusy(true);
    try {
      await updateTable(planId, tableId, {
        name: table.name,
        positionX: Math.round(x),
        positionY: Math.round(y),
        rotation: table.rotation ?? 0,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Konum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async () => {
    if (!selectedTable?.id || !renameName.trim()) return;
    setBusy(true);
    try {
      await updateTable(planId, selectedTable.id, {
        name: renameName.trim(),
        positionX: selectedTable.positionX ?? 0,
        positionY: selectedTable.positionY ?? 0,
        rotation: selectedTable.rotation ?? 0,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Masa adı güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable?.id) return;
    if (
      !window.confirm(
        `"${selectedTable.name}" silinsin mi? Sandalye atamaları kaldırılır.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deleteTable(planId, selectedTable.id);
      setSelectedTableId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Masa silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (guestId: string | number) => {
    if (!seatTarget?.table.id || !seatTarget.seat.id) return;
    setBusy(true);
    try {
      const updated = await assignGuestToSeat(
        planId,
        seatTarget.table.id,
        seatTarget.seat.id,
        guestId,
      );
      setData(updated);
      setSeatTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Atama yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnassignSeat = async () => {
    if (!seatTarget?.table.id || !seatTarget.seat.id) return;
    setBusy(true);
    try {
      const updated = await unassignSeat(
        planId,
        seatTarget.table.id,
        seatTarget.seat.id,
      );
      setData(updated);
      setSeatTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Atama kaldırılamadı.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnassignFromList = async (guest: TablePlanGuest) => {
    if (guest.assignedTableId == null || guest.assignedSeatId == null) return;
    setBusy(true);
    try {
      const updated = await unassignSeat(
        planId,
        guest.assignedTableId,
        guest.assignedSeatId,
      );
      setData(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Atama kaldırılamadı.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Masa planı yükleniyor…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />

      {error ? (
        <EventOsError message={error} onRetry={() => void load()} />
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 lg:w-56 xl:w-64">
          <TablePlanTemplatePanel onPick={setAddType} />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">Görünüm</span>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            >
              Yakınlaştır
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            >
              Uzaklaştır
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setZoom(1)}
            >
              Sıfırla
            </button>
            <span className="text-xs text-zinc-600">
              %{Math.round(zoom * 100)}
            </span>
          </div>

          <TablePlanCanvas
            tables={tables}
            selectedTableId={selectedTableId}
            zoom={zoom}
            dragPositions={dragPositions}
            onSelectTable={setSelectedTableId}
            onSeatClick={(table, seat) => setSeatTarget({ table, seat })}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />

          {selectedTable ? (
            <div className={`${glassCard} !p-4`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {selectedTable.name}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-400">
                    {tableTypeLabel(selectedTable.tableType)}
                  </p>
                  {tableTypeHasSeats(selectedTable.tableType) ? (
                    <p className="mt-2 text-sm text-zinc-300">
                      Oturan: {selectedTable.occupiedCount ?? 0} /{" "}
                      {selectedTable.capacity ?? 0}
                      <br />
                      Boş: {selectedTable.emptyCount ?? 0}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:min-w-[200px]">
                  <label className="block text-xs text-zinc-500">
                    Masa adı
                    <input
                      className={`${inputClass} mt-1`}
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnSecondary}
                      disabled={busy || !renameName.trim()}
                      onClick={() => void handleRename()}
                    >
                      Adı kaydet
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => void handleDeleteTable()}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <GuestSeatingList
        guests={guests}
        busy={busy}
        onUnassignGuest={(g) => void handleUnassignFromList(g)}
      />

      <AddTableModal
        open={addType != null}
        tableType={addType}
        defaultName={addType ? defaultTableName(addType) : ""}
        saving={busy}
        onClose={() => setAddType(null)}
        onSave={(name) => void handleCreateTable(name)}
      />

      <AssignGuestModal
        open={seatTarget != null}
        seat={seatTarget?.seat ?? null}
        guests={guests}
        saving={busy}
        onClose={() => setSeatTarget(null)}
        onAssign={(guestId) => void handleAssign(guestId)}
        onUnassign={() => void handleUnassignSeat()}
      />
    </div>
  );
}
