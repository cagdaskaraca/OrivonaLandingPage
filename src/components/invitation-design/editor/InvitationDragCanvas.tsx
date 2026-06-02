"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import { InvitationElementToolbar } from "@/src/components/invitation-design/editor/InvitationElementToolbar";
import { InvitationLayoutElementContent } from "@/src/components/invitation-design/editor/InvitationLayoutElementContent";
import "./invitation-studio.css";
import {
  bringForward,
  canDeleteElement,
  canDuplicateElement,
  deleteElementFromDoc,
  duplicateElement,
  sendBackward,
  sortByZIndex,
} from "@/src/lib/invitationEditor/canvasOps";
import { finalizeDocument, resolveQrUrl } from "@/src/lib/invitationEditor/document";
import {
  LAYOUT_CANVAS_HEIGHT,
  LAYOUT_CANVAS_WIDTH,
} from "@/src/lib/invitationEditor/layout";
import { getTemplate } from "@/src/lib/invitationEditor/templates";
import type {
  InvitationEditorDocument,
  InvitationQrUrls,
  LayoutElement,
} from "@/src/lib/invitationEditor/types";

type InvitationDragCanvasProps = {
  document: InvitationEditorDocument;
  qrUrls?: InvitationQrUrls;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onChange: (doc: InvitationEditorDocument) => void;
  readOnly?: boolean;
  scale?: number;
};

export function InvitationDragCanvas({
  document: docInput,
  qrUrls = {},
  selectedElementId,
  onSelectElement,
  onChange,
  readOnly = false,
  scale: scaleProp,
}: InvitationDragCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const doc = useMemo(() => finalizeDocument(docInput), [docInput]);
  const template = getTemplate(doc.templateId);
  const qrUrl = resolveQrUrl(doc, qrUrls);
  const { canvasWidth, canvasHeight } = doc.layoutJson;
  const scale = scaleProp ?? 1;

  const visibleElements = useMemo(
    () =>
      sortByZIndex(doc.layoutJson.elements.filter((el) => !el.hidden)),
    [doc.layoutJson.elements],
  );

  const commit = useCallback(
    (next: InvitationEditorDocument) => {
      onChange(finalizeDocument(next));
    },
    [onChange],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<LayoutElement>) => {
      const elements = doc.layoutJson.elements.map((el) =>
        el.id === id ? { ...el, ...patch } : el,
      );
      commit({
        ...doc,
        layoutJson: { ...doc.layoutJson, elements },
      });
    },
    [commit, doc],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = deleteElementFromDoc(doc, id);
      commit(next);
      if (selectedElementId === id) onSelectElement?.(null);
    },
    [commit, doc, onSelectElement, selectedElementId],
  );

  const handleCopy = useCallback(
    (id: string) => {
      const { doc: next, newId } = duplicateElement(doc, id);
      commit(next);
      if (newId) onSelectElement?.(newId);
    },
    [commit, doc, onSelectElement],
  );

  useEffect(() => {
    if (readOnly || selectedElementId == null || selectedElementId === "") return;
    const activeId = selectedElementId;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }
      const el = doc.layoutJson.elements.find((x) => x.id === activeId);
      if (!el || !canDeleteElement(el)) return;
      e.preventDefault();
      handleDelete(activeId);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [readOnly, selectedElementId, doc, handleDelete]);

  return (
    <div ref={containerRef} className="flex justify-center">
      <div
        style={{
          width: canvasWidth * scale,
          height: canvasHeight * scale,
        }}
      >
        <div
          className={`relative overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.65)] ${template.borderClass}`}
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundColor: doc.backgroundColor,
          }}
          onClick={() => onSelectElement?.(null)}
          role="presentation"
        >
          <div className={`absolute inset-0 ${template.overlayClass}`} />

          {doc.imageUrl &&
          !visibleElements.some((e) => e.type === "image" && !e.hidden) ? (
            <div className="pointer-events-none absolute inset-0 opacity-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          {template.ornament ? (
            <p
              className="pointer-events-none absolute left-0 right-0 top-3 text-center text-xl"
              style={{ color: doc.accentColor }}
              aria-hidden
            >
              {template.ornament}
            </p>
          ) : null}

          {visibleElements.map((el) => {
            const selected = selectedElementId === el.id;
            const z = el.zIndex ?? 10;
            const rotation = el.rotation ?? 0;
            const isLine =
              el.type === "shape" &&
              (el.shapeType === "line" || el.shapeType === "divider");
            const minH = isLine ? 4 : 24;

            const inner = (
              <div
                className={`invitation-rnd-drag h-full w-full p-0.5 ${
                  selected && !readOnly ? "invitation-rnd-selected" : ""
                }`}
                style={{
                  transform: rotation ? `rotate(${rotation}deg)` : undefined,
                  transformOrigin: "center center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement?.(el.id);
                }}
              >
                <InvitationLayoutElementContent el={el} doc={doc} qrUrl={qrUrl} />
              </div>
            );

            if (readOnly) {
              return (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    zIndex: z,
                  }}
                >
                  {inner}
                </div>
              );
            }

            return (
              <Rnd
                key={el.id}
                bounds="parent"
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                onDragStop={(_e, d) => {
                  updateElement(el.id, { x: d.x, y: d.y });
                }}
                onResizeStop={(_e, _dir, ref, _delta, pos) => {
                  updateElement(el.id, {
                    x: pos.x,
                    y: pos.y,
                    width: parseInt(ref.style.width, 10),
                    height: parseInt(ref.style.height, 10),
                  });
                }}
                minWidth={isLine ? 40 : 32}
                minHeight={minH}
                enableResizing={{
                  top: true,
                  right: true,
                  bottom: true,
                  left: true,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: true,
                  topLeft: true,
                }}
                dragHandleClassName="invitation-rnd-drag"
                className="invitation-rnd-drag"
                style={{ zIndex: selected ? z + 1000 : z }}
              >
                {selected ? (
                  <div
                    className="absolute left-0 z-50 -translate-y-full pb-1"
                    style={{ top: 0 }}
                  >
                    <InvitationElementToolbar
                      canDelete={canDeleteElement(el)}
                      canCopy={canDuplicateElement(el)}
                      onDelete={() => handleDelete(el.id)}
                      onCopy={() => handleCopy(el.id)}
                      onBringForward={() =>
                        commit(bringForward(doc, el.id))
                      }
                      onSendBackward={() =>
                        commit(sendBackward(doc, el.id))
                      }
                    />
                  </div>
                ) : null}
                {inner}
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
}
