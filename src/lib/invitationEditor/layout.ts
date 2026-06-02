import { assignZIndices } from "@/src/lib/invitationEditor/canvasOps";
import { resolveShapeType } from "@/src/lib/invitationEditor/shapes";
import type {
  EditorElement,
  InvitationEditorDocument,
  InvitationFontId,
  InvitationLayoutJson,
  LayoutElement,
  LayoutElementType,
  ShapeType,
} from "@/src/lib/invitationEditor/types";

const FONT_IDS: InvitationFontId[] = [
  "playfair",
  "greatVibes",
  "cinzel",
  "montserrat",
  "poppins",
];

function pickFontId(raw: unknown): InvitationFontId | undefined {
  if (typeof raw !== "string") return undefined;
  return FONT_IDS.includes(raw as InvitationFontId)
    ? (raw as InvitationFontId)
    : undefined;
}

export const LAYOUT_CANVAS_WIDTH = 420;
export const LAYOUT_CANVAS_HEIGHT = 594;

export const CORE_LAYOUT_IDS = {
  title: "title",
  description: "description",
  date: "date",
  image: "image",
  qr: "qr",
} as const;

export function defaultLayoutElements(
  doc: Pick<
    InvitationEditorDocument,
    "qr" | "imageUrl"
  >,
): LayoutElement[] {
  return [
    {
      id: CORE_LAYOUT_IDS.title,
      type: "title",
      x: 60,
      y: 88,
      width: 300,
      height: 72,
      fontSize: 28,
      align: "center",
      bold: true,
      zIndex: 10,
    },
    {
      id: CORE_LAYOUT_IDS.date,
      type: "date",
      x: 60,
      y: 175,
      width: 300,
      height: 44,
      fontSize: 16,
      align: "center",
      zIndex: 11,
    },
    {
      id: CORE_LAYOUT_IDS.description,
      type: "description",
      x: 60,
      y: 230,
      width: 300,
      height: 130,
      fontSize: 14,
      align: "center",
      zIndex: 12,
    },
    {
      id: CORE_LAYOUT_IDS.image,
      type: "image",
      x: 110,
      y: 380,
      width: 200,
      height: 120,
      hidden: !doc.imageUrl,
      url: doc.imageUrl ?? undefined,
      zIndex: 20,
    },
    {
      id: CORE_LAYOUT_IDS.qr,
      type: "qr",
      x: 160,
      y: 470,
      width: 100,
      height: 100,
      hidden: !doc.qr.enabled,
      zIndex: 30,
    },
  ];
}

const SHAPE_TYPES: ShapeType[] = [
  "circle",
  "square",
  "rectangle",
  "line",
  "heart",
  "star",
  "oval",
  "divider",
  "frame",
  "badge",
];

function pickShapeType(item: Record<string, unknown>): ShapeType | undefined {
  const raw = item.shapeType ?? item.ShapeType;
  if (typeof raw === "string" && SHAPE_TYPES.includes(raw as ShapeType)) {
    return raw as ShapeType;
  }
  if (item.shape === "circle") return "circle";
  if (item.shape === "rect") return "rectangle";
  return undefined;
}

export function defaultLayoutJson(
  doc: Pick<InvitationEditorDocument, "qr" | "imageUrl">,
): InvitationLayoutJson {
  return {
    canvasWidth: LAYOUT_CANVAS_WIDTH,
    canvasHeight: LAYOUT_CANVAS_HEIGHT,
    elements: defaultLayoutElements(doc),
  };
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

export function normalizeLayoutJson(
  raw: unknown,
  doc: Pick<InvitationEditorDocument, "qr" | "imageUrl">,
): InvitationLayoutJson {
  if (!raw || typeof raw !== "object") return defaultLayoutJson(doc);
  const o = raw as Record<string, unknown>;
  const elementsRaw = o.elements;
  if (!Array.isArray(elementsRaw) || elementsRaw.length === 0) {
    return defaultLayoutJson(doc);
  }
  const elements = elementsRaw
    .filter((el) => el && typeof el === "object")
    .map((el) => {
      const item = el as Record<string, unknown>;
      const type = String(item.type ?? "text") as LayoutElementType;
      return {
        id: String(item.id ?? newLayoutId()),
        type,
        x: num(item.x, 0),
        y: num(item.y, 0),
        width: Math.max(24, num(item.width, 100)),
        height: Math.max(24, num(item.height, 40)),
        hidden: item.hidden === true,
        content: typeof item.content === "string" ? item.content : undefined,
        fontSize: typeof item.fontSize === "number" ? item.fontSize : undefined,
        color: typeof item.color === "string" ? item.color : undefined,
        fontFamily: pickFontId(item.fontFamily),
        bold: item.bold === true,
        italic: item.italic === true,
        align:
          item.align === "left" || item.align === "right"
            ? item.align
            : item.align === "center"
              ? "center"
              : undefined,
        url: typeof item.url === "string" ? item.url : undefined,
        zIndex: typeof item.zIndex === "number" ? item.zIndex : undefined,
        rotation:
          typeof item.rotation === "number" && !Number.isNaN(item.rotation)
            ? item.rotation
            : undefined,
        shapeType: pickShapeType(item),
        shape: item.shape === "circle" ? "circle" : "rect",
        fill: typeof item.fill === "string" ? item.fill : undefined,
        stroke: typeof item.stroke === "string" ? item.stroke : undefined,
        strokeWidth:
          typeof item.strokeWidth === "number" ? item.strokeWidth : undefined,
        opacity: typeof item.opacity === "number" ? item.opacity : undefined,
        icon:
          item.icon === "heart" ||
          item.icon === "rings" ||
          item.icon === "star" ||
          item.icon === "flower"
            ? item.icon
            : undefined,
      } satisfies LayoutElement;
    });

  const withCore = ensureCoreLayoutElements(elements, doc);
  const withShapeType = withCore.map((el) =>
    el.type === "shape" && !el.shapeType
      ? { ...el, shapeType: resolveShapeType(el) }
      : el,
  );

  return {
    canvasWidth: num(o.canvasWidth, LAYOUT_CANVAS_WIDTH),
    canvasHeight: num(o.canvasHeight, LAYOUT_CANVAS_HEIGHT),
    elements: assignZIndices(withShapeType),
  };
}

export function ensureCoreLayoutElements(
  elements: LayoutElement[],
  doc: Pick<InvitationEditorDocument, "qr" | "imageUrl">,
): LayoutElement[] {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const defaults = defaultLayoutElements(doc);
  for (const d of defaults) {
    if (!byId.has(d.id)) byId.set(d.id, d);
  }
  const merged = [...byId.values()];
  return merged.map((el) => {
    if (el.id === CORE_LAYOUT_IDS.qr) {
      return { ...el, hidden: !doc.qr.enabled };
    }
    if (el.id === CORE_LAYOUT_IDS.image) {
      return {
        ...el,
        hidden: !doc.imageUrl && !el.url,
        url: el.url ?? doc.imageUrl ?? undefined,
      };
    }
    return el;
  });
}

export function newLayoutId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Eski yüzde tabanlı elements → piksel layout */
export function migratePercentElementsToLayout(
  legacy: EditorElement[],
  doc: Pick<InvitationEditorDocument, "qr" | "imageUrl">,
): InvitationLayoutJson {
  const base = defaultLayoutJson(doc);
  if (legacy.length === 0) return base;

  const cw = LAYOUT_CANVAS_WIDTH;
  const ch = LAYOUT_CANVAS_HEIGHT;
  const extra: LayoutElement[] = legacy.map((el) => {
    if (el.type === "text") {
      return {
        id: el.id,
        type: "text" as const,
        x: Math.round((el.x / 100) * cw),
        y: Math.round((el.y / 100) * ch),
        width: Math.round((el.width / 100) * cw),
        height: 48,
        content: el.content,
        fontSize: el.fontSize,
        color: el.color,
        fontFamily: el.fontFamily,
        bold: el.bold,
        italic: el.italic,
        align: el.align,
      };
    }
    if (el.type === "image") {
      return {
        id: el.id,
        type: "image" as const,
        x: Math.round((el.x / 100) * cw),
        y: Math.round((el.y / 100) * ch),
        width: Math.round((el.width / 100) * cw),
        height: Math.round((el.height / 100) * ch),
        url: el.url,
      };
    }
    if (el.type === "qr") {
      const size = Math.round((el.size / 100) * cw);
      return {
        id: el.id,
        type: "qr" as const,
        x: Math.round((el.x / 100) * cw),
        y: Math.round((el.y / 100) * ch),
        width: size,
        height: size,
      };
    }
    if (el.type === "shape") {
      return {
        id: el.id,
        type: "shape" as const,
        x: Math.round((el.x / 100) * cw),
        y: Math.round((el.y / 100) * ch),
        width: Math.round((el.width / 100) * cw),
        height: Math.round((el.height / 100) * ch),
        shape: el.shape,
        fill: el.fill,
        opacity: el.opacity,
      };
    }
    const px = Math.round((el.size / 100) * cw);
    return {
      id: el.id,
      type: "icon" as const,
      x: Math.round((el.x / 100) * cw),
      y: Math.round((el.y / 100) * ch),
      width: px,
      height: px,
      icon: el.icon,
      color: el.color,
    };
  });

  return {
    canvasWidth: cw,
    canvasHeight: ch,
    elements: [...base.elements, ...extra],
  };
}

export function updateLayoutElement(
  layout: InvitationLayoutJson,
  id: string,
  patch: Partial<LayoutElement>,
): InvitationLayoutJson {
  return {
    ...layout,
    elements: layout.elements.map((el) =>
      el.id === id ? { ...el, ...patch } : el,
    ),
  };
}

export function patchLayoutJson(
  doc: InvitationEditorDocument,
  layout: InvitationLayoutJson,
): InvitationEditorDocument {
  return { ...doc, layoutJson: layout };
}

export function syncLayoutVisibility(
  doc: InvitationEditorDocument,
): InvitationEditorDocument {
  const elements = doc.layoutJson.elements.map((el) => {
    if (el.type === "qr" || el.id === CORE_LAYOUT_IDS.qr) {
      return { ...el, hidden: !doc.qr.enabled };
    }
    if (el.type === "image" || el.id === CORE_LAYOUT_IDS.image) {
      const url = el.url ?? doc.imageUrl;
      return { ...el, url: url ?? undefined, hidden: !url };
    }
    return el;
  });
  return {
    ...doc,
    layoutJson: { ...doc.layoutJson, elements },
  };
}

export function getLayoutElementText(
  el: LayoutElement,
  doc: InvitationEditorDocument,
): string {
  switch (el.type) {
    case "title":
      return doc.title || "Davetlisiniz";
    case "date":
      return doc.dateText || "Tarih";
    case "description":
      return doc.description || "";
    case "text":
      return el.content ?? "";
    default:
      return el.content ?? "";
  }
}

export function findLayoutElement(
  doc: InvitationEditorDocument,
  id: string | null,
): LayoutElement | undefined {
  if (!id) return undefined;
  return doc.layoutJson.elements.find((e) => e.id === id);
}
