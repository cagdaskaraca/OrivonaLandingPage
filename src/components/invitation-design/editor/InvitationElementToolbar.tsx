"use client";

import "./invitation-studio.css";

type InvitationElementToolbarProps = {
  onDelete: () => void;
  onCopy: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onColor?: () => void;
  canDelete: boolean;
  canCopy: boolean;
  className?: string;
};

export function InvitationElementToolbar({
  onDelete,
  onCopy,
  onBringForward,
  onSendBackward,
  canDelete,
  canCopy,
  className = "",
}: InvitationElementToolbarProps) {
  return (
    <div
      className={`invitation-canvas-toolbar ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {canDelete ? (
        <button type="button" className="danger" onClick={onDelete}>
          Sil
        </button>
      ) : null}
      {canCopy ? (
        <button type="button" onClick={onCopy}>
          Kopyala
        </button>
      ) : null}
      <button type="button" onClick={onBringForward}>
        Öne al
      </button>
      <button type="button" onClick={onSendBackward}>
        Arkaya
      </button>
    </div>
  );
}
