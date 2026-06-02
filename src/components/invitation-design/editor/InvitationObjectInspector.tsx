"use client";

import { InvitationStudioSelect } from "@/src/components/invitation-design/editor/InvitationStudioSelect";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { INVITATION_FONT_OPTIONS } from "@/src/lib/invitationEditor/fonts";
import type {
  InvitationEditorDocument,
  InvitationFontId,
  LayoutElement,
  TextAlign,
} from "@/src/lib/invitationEditor/types";
import { btnSecondary, inputClass } from "@/src/lib/ui";
import "./invitation-studio.css";

type InvitationObjectInspectorProps = {
  selected: LayoutElement;
  doc: InvitationEditorDocument;
  onUpdate: (id: string, patch: Partial<LayoutElement>) => void;
  onDelete?: () => void;
  canDelete: boolean;
};

export function InvitationObjectInspector({
  selected,
  doc,
  onUpdate,
  onDelete,
  canDelete,
}: InvitationObjectInspectorProps) {
  const isTextLike =
    selected.type === "text" ||
    selected.type === "title" ||
    selected.type === "description" ||
    selected.type === "date";

  const isShape = selected.type === "shape";
  const isIcon = selected.type === "icon";

  if (!isTextLike && !isShape && !isIcon) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
        Seçili öğe için özellik paneli burada görünür.
      </div>
    );
  }

  if (isShape) {
    return (
      <div className="space-y-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
        <p className="text-xs font-semibold text-violet-200">Şekil özellikleri</p>
        <label className="block text-xs text-zinc-500">
          Dolgu rengi
          <input
            type="color"
            className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10"
            value={selected.fill ?? doc.accentColor}
            onChange={(e) => onUpdate(selected.id, { fill: e.target.value })}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Çizgi rengi
          <input
            type="color"
            className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10"
            value={selected.stroke ?? doc.textColor}
            onChange={(e) => onUpdate(selected.id, { stroke: e.target.value })}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Çizgi kalınlığı
          <NumericInput
            value={selected.strokeWidth ?? 2}
            onChange={(strokeWidth) => onUpdate(selected.id, { strokeWidth })}
            min={0}
            max={12}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Opaklık (%)
          <NumericInput
            value={Math.round((selected.opacity ?? 0.75) * 100)}
            onChange={(v) => onUpdate(selected.id, { opacity: v / 100 })}
            min={5}
            max={100}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Döndürme (°)
          <NumericInput
            value={selected.rotation ?? 0}
            onChange={(rotation) => onUpdate(selected.id, { rotation })}
            min={-180}
            max={180}
          />
        </label>
        {canDelete && onDelete ? (
          <button
            type="button"
            className={`${btnSecondary} w-full text-xs text-red-200`}
            onClick={onDelete}
          >
            Şekli sil
          </button>
        ) : null}
      </div>
    );
  }

  if (isIcon) {
    return (
      <div className="space-y-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
        <p className="text-xs font-semibold text-violet-200">İkon</p>
        <label className="block text-xs text-zinc-500">
          Renk
          <input
            type="color"
            className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10"
            value={selected.color ?? doc.accentColor}
            onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
          />
        </label>
        {canDelete && onDelete ? (
          <button
            type="button"
            className={`${btnSecondary} w-full text-xs text-red-200`}
            onClick={onDelete}
          >
            İkonu sil
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
      <p className="text-xs font-semibold text-violet-200">
        Metin stili
        {selected.type !== "text" ? " (sabit alan)" : ""}
      </p>
      {selected.type === "text" ? (
        <textarea
          className={`${inputClass} min-h-[60px]`}
          value={selected.content ?? ""}
          onChange={(e) => onUpdate(selected.id, { content: e.target.value })}
        />
      ) : null}
      <label className="block text-xs text-zinc-500">
        Font
        <div className="mt-1">
          <InvitationStudioSelect
            value={selected.fontFamily ?? doc.fontFamily}
            options={INVITATION_FONT_OPTIONS.map((f) => ({
              value: f.id,
              label: f.label,
            }))}
            onChange={(v) =>
              onUpdate(selected.id, { fontFamily: v as InvitationFontId })
            }
          />
        </div>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${btnSecondary} text-xs ${selected.bold ? "!bg-violet-500/30" : ""}`}
          onClick={() => onUpdate(selected.id, { bold: !selected.bold })}
        >
          Kalın
        </button>
        <button
          type="button"
          className={`${btnSecondary} text-xs ${selected.italic ? "!bg-violet-500/30" : ""}`}
          onClick={() => onUpdate(selected.id, { italic: !selected.italic })}
        >
          İtalik
        </button>
        {(["left", "center", "right"] as TextAlign[]).map((align) => (
          <button
            key={align}
            type="button"
            className={`${btnSecondary} text-xs ${selected.align === align ? "!bg-violet-500/30" : ""}`}
            onClick={() => onUpdate(selected.id, { align })}
          >
            {align === "left" ? "Sol" : align === "center" ? "Orta" : "Sağ"}
          </button>
        ))}
      </div>
      <label className="block text-xs text-zinc-500">
        Boyut
        <NumericInput
          value={selected.fontSize ?? doc.fontSize}
          onChange={(fontSize) => onUpdate(selected.id, { fontSize })}
          min={10}
          max={72}
        />
      </label>
      <label className="block text-xs text-zinc-500">
        Renk
        <input
          type="color"
          className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10"
          value={selected.color ?? doc.textColor}
          onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
        />
      </label>
      {canDelete && onDelete && selected.type === "text" ? (
        <button
          type="button"
          className={`${btnSecondary} w-full text-xs text-red-200`}
          onClick={onDelete}
        >
          Metni sil
        </button>
      ) : null}
    </div>
  );
}
