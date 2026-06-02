import { CORE_LAYOUT_IDS } from "@/src/lib/invitationEditor/layout";
import type {
  InvitationEditorDocument,
  LayoutElement,
} from "@/src/lib/invitationEditor/types";
import { newLayoutId } from "@/src/lib/invitationEditor/layout";

const CORE_TEXT_IDS = new Set<string>([
  CORE_LAYOUT_IDS.title,
  CORE_LAYOUT_IDS.date,
  CORE_LAYOUT_IDS.description,
]);

export function maxZIndex(elements: LayoutElement[]): number {
  return elements.reduce((m, el) => Math.max(m, el.zIndex ?? 0), 0);
}

export function sortByZIndex(elements: LayoutElement[]): LayoutElement[] {
  return [...elements].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  );
}

export function assignZIndices(elements: LayoutElement[]): LayoutElement[] {
  return elements.map((el, i) => ({
    ...el,
    zIndex: el.zIndex ?? i + 1,
  }));
}

export function canDeleteElement(el: LayoutElement): boolean {
  if (CORE_TEXT_IDS.has(el.id)) return false;
  return true;
}

export function canDuplicateElement(el: LayoutElement): boolean {
  return el.type !== "title" && el.type !== "date" && el.type !== "description";
}

export function deleteElementFromDoc(
  doc: InvitationEditorDocument,
  id: string,
): InvitationEditorDocument {
  const el = doc.layoutJson.elements.find((e) => e.id === id);
  if (!el || !canDeleteElement(el)) return doc;

  if (el.id === CORE_LAYOUT_IDS.qr) {
    return {
      ...doc,
      qr: { ...doc.qr, enabled: false },
      layoutJson: {
        ...doc.layoutJson,
        elements: doc.layoutJson.elements.map((e) =>
          e.id === CORE_LAYOUT_IDS.qr ? { ...e, hidden: true } : e,
        ),
      },
    };
  }

  if (el.id === CORE_LAYOUT_IDS.image) {
    return {
      ...doc,
      imageUrl: null,
      layoutJson: {
        ...doc.layoutJson,
        elements: doc.layoutJson.elements.map((e) =>
          e.id === CORE_LAYOUT_IDS.image
            ? { ...e, hidden: true, url: undefined }
            : e,
        ),
      },
    };
  }

  return {
    ...doc,
    layoutJson: {
      ...doc.layoutJson,
      elements: doc.layoutJson.elements.filter((e) => e.id !== id),
    },
  };
}

export function duplicateElement(
  doc: InvitationEditorDocument,
  id: string,
): { doc: InvitationEditorDocument; newId: string | null } {
  const el = doc.layoutJson.elements.find((e) => e.id === id);
  if (!el || !canDuplicateElement(el)) return { doc, newId: null };

  const newId = newLayoutId();
  const copy: LayoutElement = {
    ...el,
    id: newId,
    x: el.x + 24,
    y: el.y + 24,
    zIndex: maxZIndex(doc.layoutJson.elements) + 1,
  };

  return {
    doc: {
      ...doc,
      layoutJson: {
        ...doc.layoutJson,
        elements: [...doc.layoutJson.elements, copy],
      },
    },
    newId,
  };
}

export function bringForward(
  doc: InvitationEditorDocument,
  id: string,
): InvitationEditorDocument {
  const elements = sortByZIndex(doc.layoutJson.elements);
  const idx = elements.findIndex((e) => e.id === id);
  if (idx < 0 || idx >= elements.length - 1) return doc;
  const next = elements[idx + 1];
  const cur = elements[idx];
  const curZ = cur.zIndex ?? idx;
  const nextZ = next.zIndex ?? idx + 1;
  return {
    ...doc,
    layoutJson: {
      ...doc.layoutJson,
      elements: doc.layoutJson.elements.map((e) => {
        if (e.id === id) return { ...e, zIndex: nextZ };
        if (e.id === next.id) return { ...e, zIndex: curZ };
        return e;
      }),
    },
  };
}

export function sendBackward(
  doc: InvitationEditorDocument,
  id: string,
): InvitationEditorDocument {
  const elements = sortByZIndex(doc.layoutJson.elements);
  const idx = elements.findIndex((e) => e.id === id);
  if (idx <= 0) return doc;
  const prev = elements[idx - 1];
  const cur = elements[idx];
  const curZ = cur.zIndex ?? idx;
  const prevZ = prev.zIndex ?? idx - 1;
  return {
    ...doc,
    layoutJson: {
      ...doc.layoutJson,
      elements: doc.layoutJson.elements.map((e) => {
        if (e.id === id) return { ...e, zIndex: prevZ };
        if (e.id === prev.id) return { ...e, zIndex: curZ };
        return e;
      }),
    },
  };
}
