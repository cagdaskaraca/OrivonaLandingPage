import { maxZIndex } from "@/src/lib/invitationEditor/canvasOps";
import { newLayoutId } from "@/src/lib/invitationEditor/layout";
import type {
  InvitationEditorDocument,
  LayoutElement,
  ShapeType,
} from "@/src/lib/invitationEditor/types";

export type ShapeToolDef = {
  shapeType: ShapeType;
  label: string;
  symbol: string;
};

export const SHAPE_TOOLS: ShapeToolDef[] = [
  { shapeType: "circle", label: "Daire", symbol: "○" },
  { shapeType: "square", label: "Kare", symbol: "□" },
  { shapeType: "rectangle", label: "Dikdörtgen", symbol: "▭" },
  { shapeType: "oval", label: "Oval", symbol: "⬭" },
  { shapeType: "line", label: "Çizgi", symbol: "—" },
  { shapeType: "divider", label: "Ayraç", symbol: "═" },
  { shapeType: "frame", label: "Çerçeve", symbol: "▢" },
  { shapeType: "badge", label: "Rozet", symbol: "◉" },
  { shapeType: "heart", label: "Kalp", symbol: "♥" },
  { shapeType: "star", label: "Yıldız", symbol: "★" },
];

const SIZE_PRESETS: Record<
  ShapeType,
  Pick<LayoutElement, "width" | "height">
> = {
  circle: { width: 80, height: 80 },
  square: { width: 72, height: 72 },
  rectangle: { width: 180, height: 56 },
  oval: { width: 160, height: 72 },
  line: { width: 200, height: 6 },
  divider: { width: 240, height: 4 },
  frame: { width: 200, height: 140 },
  badge: { width: 120, height: 48 },
  heart: { width: 64, height: 64 },
  star: { width: 64, height: 64 },
};

export function createShapeElement(
  shapeType: ShapeType,
  doc: InvitationEditorDocument,
  offset = { x: 0, y: 0 },
): LayoutElement {
  const size = SIZE_PRESETS[shapeType];
  const isLine = shapeType === "line" || shapeType === "divider";
  const isFrame = shapeType === "frame";

  return {
    id: newLayoutId(),
    type: "shape",
    shapeType,
    x: 100 + offset.x,
    y: 280 + offset.y,
    width: size.width,
    height: size.height,
    fill: isFrame ? "transparent" : doc.accentColor,
    stroke: doc.textColor,
    strokeWidth: isLine ? 0 : isFrame ? 3 : 0,
    opacity: isFrame ? 1 : shapeType === "badge" ? 0.92 : 0.75,
    rotation: 0,
    zIndex: maxZIndex(doc.layoutJson.elements) + 1,
  };
}

export function resolveShapeType(el: LayoutElement): ShapeType {
  if (el.shapeType) return el.shapeType;
  if (el.shape === "circle") return "circle";
  return "rectangle";
}
