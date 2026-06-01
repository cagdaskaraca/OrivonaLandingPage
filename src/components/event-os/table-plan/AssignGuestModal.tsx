"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import type { TablePlanGuest, TablePlanSeat } from "@/src/lib/api/types";
import { btnSecondary, inputClass } from "@/src/lib/ui";

type AssignGuestModalProps = {
  open: boolean;
  seat: TablePlanSeat | null;
  guests: TablePlanGuest[];
  saving: boolean;
  onClose: () => void;
  onAssign: (guestId: string | number) => void;
  onUnassign: () => void;
};

export function AssignGuestModal({
  open,
  seat,
  guests,
  saving,
  onClose,
  onAssign,
  onUnassign,
}: AssignGuestModalProps) {
  const [query, setQuery] = useState("");
  const occupied = seat?.guestId != null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...guests].sort((a, b) =>
      (a.fullName ?? "").localeCompare(b.fullName ?? "", "tr"),
    );
    if (!q) return list;
    return list.filter((g) => (g.fullName ?? "").toLowerCase().includes(q));
  }, [guests, query]);

  if (!open || !seat) return null;

  return (
    <Modal
      open={open}
      title={
        occupied
          ? `Sandalye ${seat.seatNumber ?? ""} — ${seat.guestName ?? "Dolu"}`
          : `Sandalye ${seat.seatNumber ?? ""} — Davetli seç`
      }
      onClose={onClose}
    >
      {occupied ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={btnSecondary}
            disabled={saving}
            onClick={onUnassign}
          >
            Sandalyeyi boşalt
          </button>
          <p className="w-full text-xs text-zinc-500">
            Davetliyi değiştirmek için listeden yeni bir davetli seçin.
          </p>
        </div>
      ) : null}

      <input
        className={`${inputClass} mb-4`}
        placeholder="Davetli ara…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="max-h-64 space-y-1 overflow-y-auto orivona-scroll-y">
        {filtered.length === 0 ? (
          <li className="py-4 text-center text-sm text-zinc-500">
            Davetli bulunamadı.
          </li>
        ) : (
          filtered.map((g) => {
            const assignedElsewhere =
              g.isAssigned &&
              String(g.assignedSeatId) !== String(seat.id);
            return (
              <li key={String(g.id)}>
                <button
                  type="button"
                  disabled={saving}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left text-sm transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 disabled:opacity-50"
                  onClick={() => g.id != null && onAssign(g.id)}
                >
                  <span className="font-medium text-white">{g.fullName}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {g.isAssigned
                      ? `${g.assignedTableName ?? "Masa"} · Sandalye ${g.assignedSeatNumber ?? "?"}`
                      : "Atanmadı"}
                  </span>
                </button>
                {assignedElsewhere ? (
                  <p className="px-3 pb-1 text-[10px] text-amber-200/80">
                    Başka sandalyede — seçince taşınır.
                  </p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </Modal>
  );
}
