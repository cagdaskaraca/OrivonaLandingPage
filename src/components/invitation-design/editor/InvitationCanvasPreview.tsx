"use client";

import { useMemo } from "react";
import { InvitationDragCanvas } from "@/src/components/invitation-design/editor/InvitationDragCanvas";
import { finalizeDocument } from "@/src/lib/invitationEditor/document";
import type {
  InvitationEditorDocument,
  InvitationQrUrls,
} from "@/src/lib/invitationEditor/types";

type InvitationCanvasPreviewProps = {
  document: InvitationEditorDocument;
  qrUrls?: InvitationQrUrls;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  interactive?: boolean;
  className?: string;
};

export function InvitationCanvasPreview({
  document: docInput,
  qrUrls = {},
  selectedElementId,
  onSelectElement,
  interactive = false,
  className = "",
}: InvitationCanvasPreviewProps) {
  const doc = useMemo(() => finalizeDocument(docInput), [docInput]);
  const { canvasWidth, canvasHeight } = doc.layoutJson;
  const maxWidth = 340;
  const scale = Math.min(
    maxWidth / canvasWidth,
    (maxWidth * 1.15) / canvasHeight,
    1,
  );

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
