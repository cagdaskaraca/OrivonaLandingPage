"use client";

import { useState } from "react";
import type { InvitationEditorJson } from "@/src/lib/api/types";
import { uploadInvitationDesignFile } from "@/src/lib/api/invitationDesigns";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { InvitationDesignPreview } from "@/src/components/invitation-design/InvitationDesignPreview";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnSecondary, inputClass } from "@/src/lib/ui";
import type { InvitationDesign } from "@/src/lib/api/types";

type SimpleInvitationEditorProps = {
  value: InvitationEditorJson;
  onChange: (next: InvitationEditorJson) => void;
};

export function SimpleInvitationEditor({
  value,
  onChange,
}: SimpleInvitationEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadInvitationDesignFile(file);
      onChange({ ...value, imageUrl: url });
    } catch (err) {
      logApiError("Invitation image upload", err);
      setUploadError(formatUiErrorMessage(err, "Görsel yüklenemedi."));
    } finally {
      setUploading(false);
    }
  }

  const previewDesign: InvitationDesign = {
    sourceType: "Editor",
    designJson: value,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Arka plan rengi</span>
          <input
            type="color"
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
            value={value.backgroundColor}
            onChange={(e) =>
              onChange({ ...value, backgroundColor: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Başlık</span>
          <input
            className={inputClass}
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            value={value.description}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Tarih metni</span>
          <input
            className={inputClass}
            value={value.dateText}
            onChange={(e) => onChange({ ...value, dateText: e.target.value })}
            placeholder="12 Temmuz 2027 · İstanbul"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Yazı rengi</span>
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
              value={value.textColor}
              onChange={(e) => onChange({ ...value, textColor: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Yazı boyutu</span>
            <NumericInput
              value={value.fontSize}
              onChange={(fontSize) => onChange({ ...value, fontSize })}
              min={12}
              max={48}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Görsel</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100"
            disabled={uploading}
            onChange={(e) => void handleImageUpload(e)}
          />
          {uploading ? (
            <p className="mt-1 text-xs text-zinc-500">Görsel yükleniyor…</p>
          ) : null}
          {uploadError ? (
            <p className="mt-1 text-xs text-red-300">{uploadError}</p>
          ) : null}
          {value.imageUrl ? (
            <button
              type="button"
              className={`${btnSecondary} mt-2 text-xs`}
              onClick={() => onChange({ ...value, imageUrl: null })}
            >
              Görseli kaldır
            </button>
          ) : null}
        </label>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-300/90">
          Önizleme
        </p>
        <InvitationDesignPreview design={previewDesign} editorJson={value} />
      </div>
    </div>
  );
}
