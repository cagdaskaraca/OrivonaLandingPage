"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  assignGuestToTable,
  createSeatingTable,
  deleteSeatingTable,
  fetchEventPlanGuests,
  fetchEventPlanSeating,
} from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventGuest, SeatingTable } from "@/src/lib/api/types";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

function SeatingPanel({ planId }: { planId: string | number }) {
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [assignGuestId, setAssignGuestId] = useState("");
  const [assignTableId, setAssignTableId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, g] = await Promise.all([
        fetchEventPlanSeating(planId),
        fetchEventPlanGuests(planId),
      ]);
      setTables(t);
      setGuests(g);
    } catch (err) {
      logApiError("Seating", err);
      setTables([]);
      setError(formatUiErrorMessage(err, "Masa planı yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    if (!tableName.trim()) return;
    try {
      await createSeatingTable(planId, {
        name: tableName.trim(),
        capacity,
      });
      setTableName("");
      setCapacity(8);
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Masa eklenemedi."));
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignGuestId || !assignTableId) return;
    setAssigning(true);
    try {
      await assignGuestToTable(planId, assignGuestId, assignTableId);
      setAssignGuestId("");
      setAssignTableId("");
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Atama yapılamadı."));
    } finally {
      setAssigning(false);
    }
  }

  function guestsAtTable(table: SeatingTable): EventGuest[] {
    if (table.guests?.length) return table.guests;
    return guests.filter((g) => g.tableId === table.id);
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Masa planı yükleniyor…</p>
      ) : tables.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
          Henüz masa tanımlanmadı.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tables.map((table) => {
            const seated = guestsAtTable(table);
            return (
              <div
                key={String(table.id)}
                className="rounded-xl border border-violet-400/15 bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">
                      {table.name ?? "Masa"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Kapasite: {table.capacity ?? "—"} · Oturan:{" "}
                      {seated.length}
                    </p>
                  </div>
                  {table.id != null ? (
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-red-300"
                      onClick={async () => {
                        try {
                          await deleteSeatingTable(planId, table.id!);
                          await load();
                        } catch (err) {
                          setError(formatUiErrorMessage(err, "Silinemedi."));
                        }
                      }}
                    >
                      Sil
                    </button>
                  ) : null}
                </div>
                {seated.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                    {seated.map((g) => (
                      <li key={String(g.id)}>
                        · {g.fullName ?? g.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-zinc-600">Boş masa</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <form
        onSubmit={handleAddTable}
        className="flex flex-wrap items-end gap-2 border-t border-white/10 pt-4"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Masa adı</span>
          <input
            className={inputClass}
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Kapasite</span>
          <NumericInput
            min={1}
            className={`${inputClass} w-24`}
            value={capacity}
            onChange={setCapacity}
          />
        </label>
        <button type="submit" className={btnSecondary}>
          Masa ekle
        </button>
      </form>
      {guests.length > 0 && tables.length > 0 ? (
        <form
          onSubmit={handleAssign}
          className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-3"
        >
          <p className="text-sm font-medium text-violet-200/90 sm:col-span-3">
            Misafir ata
          </p>
          <select
            className={selectClass}
            value={assignGuestId}
            onChange={(e) => setAssignGuestId(e.target.value)}
            required
          >
            <option value="">Misafir seçin</option>
            {guests.map((g) => (
              <option key={String(g.id)} value={String(g.id)}>
                {g.fullName ?? g.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={assignTableId}
            onChange={(e) => setAssignTableId(e.target.value)}
            required
          >
            <option value="">Masa seçin</option>
            {tables.map((t) => (
              <option key={String(t.id)} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
          <button type="submit" className={btnPrimary} disabled={assigning}>
            {assigning ? "…" : "Ata"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function EventOsSeatingSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <SeatingPanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
