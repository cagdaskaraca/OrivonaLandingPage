"use client";

import { useMemo } from "react";
import { InvitationDragCanvas } from "@/src/components/invitation-design/editor/InvitationDragCanvas";
import { finalizeDocument } from "@/src/lib/invitationEditor/document";
import {
  LAYOUT_CANVAS_HEIGHT,
  LAYOUT_CANVAS_WIDTH,
} from "@/src/lib/invitationEditor/layout";
import type {
  InvitationEditorDocument,
  InvitationQrUrls,
  PreviewViewport,
} from "@/src/lib/invitationEditor/types";

type InvitationCanvasPreviewProps = {
  document: InvitationEditorDocument;
  viewport: PreviewViewport;
  qrUrls?: InvitationQrUrls;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  interactive?: boolean;
  className?: string;
};

export function InvitationCanvasPreview({
  document: docInput,
  viewport,
  qrUrls = {},
  selectedElementId,
  onSelectElement,
  interactive = false,
  className = "",
}: InvitationCanvasPreviewProps) {
  const doc = useMemo(() => finalizeDocument(docInput), [docInput]);

  const maxWidth = viewport === "a4" ? 360 : 300;
  const targetHeight =
    viewport === "a4"
      ? (maxWidth * LAYOUT_CANVAS_HEIGHT) / LAYOUT_CANVAS_WIDTH
      : maxWidth * (16 / 9);
  const scale =
    viewport === "mobile"
      ? maxWidth / LAYOUT_CANVAS_WIDTH
      : Math.min(maxWidth / LAYOUT_CANVAS_WIDTH, targetHeight / LAYOUT_CANVAS_HEIGHT);

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className="rounded-2xl border border-violet-400/20 bg-[#06040c] p-3"
        style={{ maxWidth }}
      >
        <InvitationDragCanvas
          document={doc}
          qrUrls={qrUrls}
          selectedElementId={selectedElementId}
          onSelectElement={interactive ? onSelectElement : undefined}
          onChange={() => {}}
          readOnly
          scale={scale}
        />
      </div>
    </div>
  );
}
