"use client";

import { useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import { InvitationLayoutElementContent } from "@/src/components/invitation-design/editor/InvitationLayoutElementContent";
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

const CORE_NO_DELETE = new Set(["title", "description", "date"]);

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

  const visibleElements = doc.layoutJson.elements.filter((el) => !el.hidden);

  function updateElement(id: string, patch: Partial<LayoutElement>) {
    const elements = doc.layoutJson.elements.map((el) =>
      el.id === id ? { ...el, ...patch } : el,
    );
    onChange(
      finalizeDocument({
        ...doc,
        layoutJson: { ...doc.layoutJson, elements },
      }),
    );
  }

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

          {doc.imageUrl && !visibleElements.some((e) => e.type === "image" && !e.hidden) ? (
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
            const label =
              el.type === "title"
                ? "Başlık"
                : el.type === "description"
                  ? "Açıklama"
                  : el.type === "date"
                    ? "Tarih"
                    : el.type === "image"
                      ? "Görsel"
                      : el.type === "qr"
                        ? "QR"
                        : undefined;

            const inner = (
              <div
                className={`h-full w-full p-1 ${selected && !readOnly ? "ring-2 ring-violet-400/90 ring-offset-1 ring-offset-transparent rounded" : ""}`}
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
                    zIndex: selected ? 20 : 10,
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
                minWidth={32}
                minHeight={24}
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
                style={{ zIndex: selected ? 30 : 10 }}
              >
                {label && selected ? (
                  <span className="absolute -top-5 left-0 rounded bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
                    {label}
                  </span>
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

export { CORE_NO_DELETE };
