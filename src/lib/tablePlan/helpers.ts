import type { TablePlanTableType } from "@/src/lib/api/types";

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;

export type TableTemplate = {
  tableType: TablePlanTableType;
  label: string;
  shortLabel: string;
};

export const TABLE_TEMPLATES: TableTemplate[] = [
  { tableType: "Square4", label: "4 kişilik kare masa", shortLabel: "Kare 4" },
  {
    tableType: "Rectangle6",
    label: "6 kişilik dikdörtgen masa",
    shortLabel: "Dikdörtgen 6",
  },
  {
    tableType: "Rectangle8",
    label: "8 kişilik dikdörtgen masa",
    shortLabel: "Dikdörtgen 8",
  },
  { tableType: "Round6", label: "6 kişilik yuvarlak masa", shortLabel: "Yuvarlak 6" },
  { tableType: "Round8", label: "8 kişilik yuvarlak masa", shortLabel: "Yuvarlak 8" },
  {
    tableType: "Round10",
    label: "10 kişilik yuvarlak masa",
    shortLabel: "Yuvarlak 10",
  },
  { tableType: "Stage", label: "Sahne", shortLabel: "Sahne" },
  { tableType: "DanceFloor", label: "Dans alanı", shortLabel: "Dans" },
  { tableType: "CustomArea", label: "Özel alan", shortLabel: "Özel alan" },
];

export function tableTypeHasSeats(type: string | undefined): boolean {
  return type !== "Stage" && type !== "DanceFloor" && type !== "CustomArea";
}

export function tableTypeLabel(type: string | undefined): string {
  const found = TABLE_TEMPLATES.find((t) => t.tableType === type);
  return found?.label ?? type ?? "Masa";
}

export function getTableDimensions(type: string | undefined): {
  width: number;
  height: number;
} {
  switch (type) {
    case "Square4":
      return { width: 96, height: 96 };
    case "Rectangle6":
      return { width: 132, height: 76 };
    case "Rectangle8":
      return { width: 168, height: 84 };
    case "Round6":
      return { width: 108, height: 108 };
    case "Round8":
      return { width: 120, height: 120 };
    case "Round10":
      return { width: 132, height: 132 };
    case "Stage":
      return { width: 220, height: 88 };
    case "DanceFloor":
      return { width: 180, height: 180 };
    case "CustomArea":
      return { width: 140, height: 140 };
    default:
      return { width: 100, height: 100 };
  }
}

export function isRoundTable(type: string | undefined): boolean {
  return (
    type === "Round6" ||
    type === "Round8" ||
    type === "Round10"
  );
}

export type SeatOffset = { x: number; y: number };

/** Seat button centers relative to table box top-left (before table position). */
export function getSeatOffsets(
  type: string | undefined,
  width: number,
  height: number,
  seatCount: number,
): SeatOffset[] {
  const cx = width / 2;
  const cy = height / 2;
  const pad = 22;

  if (!tableTypeHasSeats(type) || seatCount <= 0) return [];

  if (isRoundTable(type)) {
    const radius = Math.max(width, height) / 2 + pad;
    const offsets: SeatOffset[] = [];
    for (let i = 0; i < seatCount; i++) {
      const angle = (i / seatCount) * Math.PI * 2 - Math.PI / 2;
      offsets.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      });
    }
    return offsets;
  }

  if (type === "Square4" && seatCount >= 4) {
    return [
      { x: cx, y: -pad },
      { x: width + pad, y: cy },
      { x: cx, y: height + pad },
      { x: -pad, y: cy },
    ].slice(0, seatCount);
  }

  if (type === "Rectangle6" || type === "Rectangle8") {
    const top = Math.ceil(seatCount / 2);
    const bottom = seatCount - top;
    const offsets: SeatOffset[] = [];
    for (let i = 0; i < top; i++) {
      const t = top === 1 ? 0.5 : i / (top - 1);
      offsets.push({ x: width * t, y: -pad });
    }
    for (let i = 0; i < bottom; i++) {
      const t = bottom === 1 ? 0.5 : i / (bottom - 1);
      offsets.push({ x: width * t, y: height + pad });
    }
    return offsets;
  }

  const radius = Math.max(width, height) / 2 + pad;
  const offsets: SeatOffset[] = [];
  for (let i = 0; i < seatCount; i++) {
    const angle = (i / seatCount) * Math.PI * 2 - Math.PI / 2;
    offsets.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return offsets;
}

export function guestInitials(name: string | undefined | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function defaultNewTablePosition(tableCount: number): {
  positionX: number;
  positionY: number;
} {
  const col = tableCount % 5;
  const row = Math.floor(tableCount / 5);
  return {
    positionX: 80 + col * 140,
    positionY: 80 + row * 120,
  };
}
