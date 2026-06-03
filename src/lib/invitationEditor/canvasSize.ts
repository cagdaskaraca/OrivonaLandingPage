import type { InvitationLayoutJson } from "@/src/lib/invitationEditor/types";

export type CanvasViewportType = "a4" | "mobile" | "square";

export type InvitationCanvasMeta = {
  type: CanvasViewportType;
  width: number;
  height: number;
};

export const CANVAS_PRESETS: Record<CanvasViewportType, InvitationCanvasMeta> = {
  a4: { type: "a4", width: 420, height: 594 },
  mobile: { type: "mobile", width: 360, height: 640 },
  square: { type: "square", width: 420, height: 420 },
};

export function inferCanvasType(
  width: number,
  height: number,
): CanvasViewportType {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.08) return "square";
  if (ratio < 0.72) return "mobile";
  return "a4";
}

export function canvasFromLayout(
  layout: Pick<InvitationLayoutJson, "canvasWidth" | "canvasHeight">,
): InvitationCanvasMeta {
  const width = layout.canvasWidth;
  const height = layout.canvasHeight;
  const type = inferCanvasType(width, height);
  return { type, width, height };
}

export function applyCanvasPreset(
  layout: InvitationLayoutJson,
  type: CanvasViewportType,
): InvitationLayoutJson {
  const preset = CANVAS_PRESETS[type];
  return {
    ...layout,
    canvasWidth: preset.width,
    canvasHeight: preset.height,
  };
}
