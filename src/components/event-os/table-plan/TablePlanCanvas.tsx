"use client";

import { useCallback, useRef, useState } from "react";
import type { TablePlanSeat, TablePlanTable } from "@/src/lib/api/types";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  getSeatOffsets,
  getTableDimensions,
  guestInitials,
  isRoundTable,
  tableTypeHasSeats,
} from "@/src/lib/tablePlan/helpers";

type DragState = {
  tableId: string | number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
};

type TablePlanCanvasProps = {
  tables: TablePlanTable[];
  selectedTableId: string | number | null;
  zoom: number;
  dragPositions: Record<string, { x: number; y: number }>;
  onSelectTable: (id: string | number | null) => void;
  onSeatClick: (table: TablePlanTable, seat: TablePlanSeat) => void;
  onDragMove: (tableId: string | number, x: number, y: number) => void;
  onDragEnd: (tableId: string | number, x: number, y: number) => void;
};

function TableOnCanvas({
  table,
  selected,
  dragOverride,
  onSelect,
  onSeatClick,
  onDragStart,
}: {
  table: TablePlanTable;
  selected: boolean;
  dragOverride?: { x: number; y: number };
  onSelect: () => void;
  onSeatClick: (seat: TablePlanSeat) => void;
  onDragStart: (e: React.PointerEvent, table: TablePlanTable) => void;
}) {
  const type = table.tableType ?? "Round8";
  const { width, height } = getTableDimensions(type);
  const x = dragOverride?.x ?? table.positionX ?? 0;
  const y = dragOverride?.y ?? table.positionY ?? 0;
  const seats = table.seats ?? [];
  const seatOffsets = tableTypeHasSeats(type)
    ? getSeatOffsets(type, width, height, seats.length)
    : [];
  const round = isRoundTable(type);
  const isArea =
    type === "Stage" || type === "DanceFloor" || type === "CustomArea";

  const tableShapeClass = round
    ? "rounded-full"
    : type === "Square4"
      ? "rounded-lg"
      : "rounded-xl";

  const areaStyle =
    type === "Stage"
      ? "bg-gradient-to-b from-amber-500/25 to-amber-600/10 border-amber-400/30"
      : type === "DanceFloor"
        ? "bg-gradient-to-br from-fuchsia-500/20 to-violet-600/10 border-fuchsia-400/25"
        : type === "CustomArea"
          ? "bg-gradient-to-br from-zinc-500/15 to-violet-500/10 border-zinc-400/25"
          : "bg-gradient-to-br from-violet-600/25 to-violet-900/20 border-violet-400/35";

  return (
    <div
      className="absolute touch-none select-none"
      style={{
        left: x,
        top: y,
        width: width + 48,
        height: height + 48,
        zIndex: selected ? 20 : 10,
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-seat]")) return;
        onSelect();
        onDragStart(e, table);
      }}
    >
      {seats.map((seat, i) => {
        const off = seatOffsets[i];
        if (!off || seat.id == null) return null;
        const filled = seat.guestId != null;
        return (
          <button
            key={String(seat.id)}
            type="button"
            data-seat
            className={`absolute z-30 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold transition-all ${
              filled
                ? "border border-violet-300/50 bg-violet-500/50 text-violet-50 shadow-[0_0_12px_rgba(167,139,250,0.45)]"
                : "border border-dashed border-zinc-500/60 bg-black/40 text-zinc-500 hover:border-violet-400/50 hover:text-violet-200"
            }`}
            style={{ left: off.x + 24, top: off.y + 24 }}
            title={
              filled
                ? (seat.guestName ?? "Dolu")
                : `Sandalye ${seat.seatNumber ?? i + 1}`
            }
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSeatClick(seat);
            }}
          >
            {filled ? guestInitials(seat.guestName) : seat.seatNumber ?? i + 1}
          </button>
        );
      })}

      <div
        className={`absolute left-6 top-6 flex cursor-grab items-center justify-center border text-center active:cursor-grabbing ${tableShapeClass} ${isArea ? areaStyle : "border-violet-400/35 bg-violet-600/20"} ${
          selected
            ? "ring-2 ring-violet-400/70 shadow-[0_0_24px_rgba(139,92,246,0.45)]"
            : ""
        }`}
        style={{ width, height }}
      >
        <span className="pointer-events-none px-2 text-xs font-semibold text-white drop-shadow-sm">
          {table.name}
        </span>
      </div>
    </div>
  );
}

export function TablePlanCanvas({
  tables,
  selectedTableId,
  zoom,
  dragPositions,
  onSelectTable,
  onSeatClick,
  onDragMove,
  onDragEnd,
}: TablePlanCanvasProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent, table: TablePlanTable) => {
      if (table.id == null) return;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      const key = String(table.id);
      const pos = dragPositions[key] ?? {
        x: table.positionX ?? 0,
        y: table.positionY ?? 0,
      };
      setDrag({
        tableId: table.id,
        startClientX: e.clientX,
        startClientY: e.clientY,
        originX: pos.x,
        originY: pos.y,
      });
    },
    [dragPositions],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const dx = (e.clientX - drag.startClientX) / zoom;
      const dy = (e.clientY - drag.startClientY) / zoom;
      const nx = Math.max(0, Math.min(CANVAS_WIDTH - 40, drag.originX + dx));
      const ny = Math.max(0, Math.min(CANVAS_HEIGHT - 40, drag.originY + dy));
      onDragMove(drag.tableId, nx, ny);
    },
    [drag, zoom, onDragMove],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const dx = (e.clientX - drag.startClientX) / zoom;
      const dy = (e.clientY - drag.startClientY) / zoom;
      const nx = Math.max(0, Math.min(CANVAS_WIDTH - 40, drag.originX + dx));
      const ny = Math.max(0, Math.min(CANVAS_HEIGHT - 40, drag.originY + dy));
      onDragEnd(drag.tableId, nx, ny);
      setDrag(null);
    },
    [drag, zoom, onDragEnd],
  );

  return (
    <div
      ref={canvasRef}
      className="relative min-h-[320px] flex-1 overflow-auto rounded-2xl border border-violet-200/[0.08] bg-[#0a0612]/80 orivona-scroll-x orivona-scroll-y"
      onClick={() => onSelectTable(null)}
    >
      <div
        className="relative origin-top-left"
        style={{
          width: CANVAS_WIDTH * zoom,
          height: CANVAS_HEIGHT * zoom,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="relative bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.08)_0%,transparent_70%)]"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {tables.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <p className="max-w-sm text-sm text-zinc-500">
                Henüz masa eklenmedi. Soldaki şablonlardan masa ekleyerek
                başlayın.
              </p>
            </div>
          ) : null}

          {tables.map((table) => {
            if (table.id == null) return null;
            const key = String(table.id);
            return (
              <TableOnCanvas
                key={key}
                table={table}
                selected={String(selectedTableId) === key}
                dragOverride={dragPositions[key]}
                onSelect={() => onSelectTable(table.id!)}
                onSeatClick={(seat) => onSeatClick(table, seat)}
                onDragStart={handleDragStart}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
