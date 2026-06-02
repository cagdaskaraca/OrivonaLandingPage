"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ImagePlus,
  QrCode,
  Shapes,
  Sparkles,
  Type,
} from "lucide-react";
import { InvitationCanvasPreview } from "@/src/components/invitation-design/editor/InvitationCanvasPreview";
import { InvitationEditorFontProvider } from "@/src/components/invitation-design/editor/InvitationEditorFontProvider";
import { uploadInvitationDesignFile } from "@/src/lib/api/invitationDesigns";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import {
  newElementId,
  syncLegacyTextFields,
} from "@/src/lib/invitationEditor/document";
import { INVITATION_FONT_OPTIONS } from "@/src/lib/invitationEditor/fonts";
import {
  applyTemplateToDocument,
  INVITATION_TEMPLATES,
} from "@/src/lib/invitationEditor/templates";
import type {
  EditorElement,
  EditorTextElement,
  InvitationEditorDocument,
  InvitationFontId,
  InvitationQrUrls,
  InvitationTemplateId,
  PreviewViewport,
  TextAlign,
} from "@/src/lib/invitationEditor/types";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnSecondary, inputClass } from "@/src/lib/ui";

type CanvaInvitationEditorProps = {
  designTitle: string;
  onDesignTitleChange: (value: string) => void;
  document: InvitationEditorDocument;
  onChange: (next: InvitationEditorDocument) => void;
  qrUrls?: InvitationQrUrls;
};

const toolBtn =
  "flex w-full items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2.5 text-left text-sm text-violet-100 transition-colors hover:border-violet-400/45 hover:bg-violet-500/20";

function updateDoc(
  doc: InvitationEditorDocument,
  patch: Partial<InvitationEditorDocument>,
): InvitationEditorDocument {
  return syncLegacyTextFields({ ...doc, ...patch });
}

export function CanvaInvitationEditor({
  designTitle,
  onDesignTitleChange,
  document: doc,
  onChange,
  qrUrls = {},
}: CanvaInvitationEditorProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("a4");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selected = useMemo(
    () => doc.elements.find((e) => e.id === selectedId),
    [doc.elements, selectedId],
  );

  const patch = useCallback(
    (partial: Partial<InvitationEditorDocument>) => {
      onChange(updateDoc(doc, partial));
    },
    [doc, onChange],
  );

  const patchFields = useCallback(
    (fields: Partial<InvitationEditorDocument["fields"]>) => {
      onChange(
        syncLegacyTextFields({
          ...doc,
          fields: { ...doc.fields, ...fields },
        }),
      );
    },
    [doc, onChange],
  );

  const patchElements = useCallback(
    (elements: EditorElement[]) => {
      onChange(syncLegacyTextFields({ ...doc, elements }));
    },
    [doc, onChange],
  );

  const updateElement = useCallback(
    (id: string, next: EditorElement) => {
      patchElements(doc.elements.map((e) => (e.id === id ? next : e)));
    },
    [doc.elements, patchElements],
  );

  function applyTemplate(templateId: InvitationTemplateId) {
    onChange(applyTemplateToDocument(doc, templateId));
  }

  function addText() {
    const el: EditorTextElement = {
      id: newElementId(),
      type: "text",
      content: "Yeni metin",
      x: 15,
      y: 55,
      width: 70,
      fontSize: 16,
      color: doc.textColor,
      fontFamily: doc.fontFamily,
      bold: false,
      italic: false,
      align: "center",
    };
    patchElements([...doc.elements, el]);
    setSelectedId(el.id);
  }

  async function addImage(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadInvitationDesignFile(file);
      const el = {
        id: newElementId(),
        type: "image" as const,
        url,
        x: 20,
        y: 35,
        width: 60,
        height: 35,
      };
      patchElements([...doc.elements, el]);
      setSelectedId(el.id);
    } catch (err) {
      logApiError("Editor image upload", err);
      setUploadError(formatUiErrorMessage(err, "Görsel yüklenemedi."));
    } finally {
      setUploading(false);
    }
  }

  function addShape(shape: "rect" | "circle") {
    const el = {
      id: newElementId(),
      type: "shape" as const,
      shape,
      x: 30,
      y: 40,
      width: 40,
      height: shape === "circle" ? 40 : 18,
      fill: doc.accentColor,
      opacity: 0.35,
    };
    patchElements([...doc.elements, el]);
    setSelectedId(el.id);
  }

  function addQrElement() {
    patch({
      qr: { ...doc.qr, enabled: true },
    });
    const el = {
      id: newElementId(),
      type: "qr" as const,
      x: 38,
      y: 78,
      size: 22,
    };
    patchElements([...doc.elements, el]);
    setSelectedId(el.id);
  }

  function addIcon(icon: "heart" | "rings" | "star" | "flower") {
    const el = {
      id: newElementId(),
      type: "icon" as const,
      icon,
      x: 42,
      y: 20,
      size: 10,
      color: doc.accentColor,
    };
    patchElements([...doc.elements, el]);
    setSelectedId(el.id);
  }

  return (
    <InvitationEditorFontProvider>
      <div className="space-y-5">
        {/* Şablon galerisi */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            Şablonlar
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {INVITATION_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                  doc.templateId === t.id
                    ? "border-violet-400/60 bg-violet-500/25 text-white shadow-[0_0_20px_-4px_rgba(167,139,250,0.5)]"
                    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-violet-400/30"
                }`}
              >
                <span
                  className="mb-1.5 block h-8 w-12 rounded-md border border-white/10"
                  style={{ background: t.backgroundColor }}
                  aria-hidden
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3 kolon */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          {/* Sol */}
          <aside className="space-y-3 md:col-span-2 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
              Davetiye bilgileri
            </p>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-zinc-500">Davetiye adı</span>
              <input
                className={inputClass}
                value={designTitle}
                onChange={(e) => onDesignTitleChange(e.target.value)}
                placeholder="Davetiyem"
              />
            </label>
            {(
              [
                ["brideName", "Gelin adı"],
                ["groomName", "Damat adı"],
                ["date", "Tarih"],
                ["time", "Saat"],
                ["venue", "Salon"],
                ["address", "Adres"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-xs text-zinc-500">{label}</span>
                <input
                  className={inputClass}
                  value={doc.fields[key]}
                  onChange={(e) => patchFields({ [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-zinc-500">Açıklama</span>
              <textarea
                className={`${inputClass} min-h-[72px] resize-y`}
                value={doc.fields.notes}
                onChange={(e) => patchFields({ notes: e.target.value })}
              />
            </label>
          </aside>

          {/* Orta */}
          <div className="space-y-4 md:col-span-1 lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
              Tasarım araçları
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button type="button" className={toolBtn} onClick={addText}>
                <Type size={18} /> Metin ekle
              </button>
              <label className={toolBtn}>
                <ImagePlus size={18} />
                {uploading ? "Yükleniyor…" : "Görsel ekle"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void addImage(f);
                  }}
                />
              </label>
              <button
                type="button"
                className={toolBtn}
                onClick={() => addShape("rect")}
              >
                <Shapes size={18} /> Şekil ekle
              </button>
              <button type="button" className={toolBtn} onClick={addQrElement}>
                <QrCode size={18} /> QR kod ekle
              </button>
              <div className={toolBtn}>
                <Sparkles size={18} className="shrink-0" />
                <span className="flex-1">İkon ekle</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-1">
                {(
                  [
                    ["heart", "♥"],
                    ["rings", "💍"],
                    ["star", "★"],
                    ["flower", "✿"],
                  ] as const
                ).map(([icon, sym]) => (
                  <button
                    key={icon}
                    type="button"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm hover:border-violet-400/40"
                    onClick={() => addIcon(icon)}
                    title="İkon ekle"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
            {uploadError ? (
              <p className="text-xs text-red-300">{uploadError}</p>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-400">Font</p>
              <select
                className={inputClass}
                value={doc.fontFamily}
                onChange={(e) =>
                  patch({ fontFamily: e.target.value as InvitationFontId })
                }
              >
                {INVITATION_FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-400">QR kod</p>
              <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={doc.qr.enabled}
                  onChange={(e) =>
                    patch({ qr: { ...doc.qr, enabled: e.target.checked } })
                  }
                />
                QR göster
              </label>
              <select
                className={inputClass}
                value={doc.qr.source}
                onChange={(e) =>
                  patch({
                    qr: {
                      ...doc.qr,
                      source: e.target.value as "invite" | "publicPage",
                    },
                  })
                }
              >
                <option value="invite" disabled={!qrUrls.inviteUrl}>
                  Ortak Davet Linki
                  {qrUrls.inviteUrl ? "" : " (henüz yok)"}
                </option>
                <option value="publicPage" disabled={!qrUrls.publicPageUrl}>
                  Herkese Açık Etkinlik Sayfası
                  {qrUrls.publicPageUrl ? "" : " (henüz yok)"}
                </option>
              </select>
            </div>

            {selected?.type === "text" ? (
              <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3 space-y-3">
                <p className="text-xs font-semibold text-violet-200">Metin düzenle</p>
                <textarea
                  className={`${inputClass} min-h-[60px]`}
                  value={selected.content}
                  onChange={(e) =>
                    updateElement(selected.id, {
                      ...selected,
                      content: e.target.value,
                    })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs ${selected.bold ? "!bg-violet-500/30" : ""}`}
                    onClick={() =>
                      updateElement(selected.id, {
                        ...selected,
                        bold: !selected.bold,
                      })
                    }
                  >
                    Kalın
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs ${selected.italic ? "!bg-violet-500/30" : ""}`}
                    onClick={() =>
                      updateElement(selected.id, {
                        ...selected,
                        italic: !selected.italic,
                      })
                    }
                  >
                    İtalik
                  </button>
                  {(["left", "center", "right"] as TextAlign[]).map((align) => (
                    <button
                      key={align}
                      type="button"
                      className={`${btnSecondary} text-xs ${selected.align === align ? "!bg-violet-500/30" : ""}`}
                      onClick={() =>
                        updateElement(selected.id, { ...selected, align })
                      }
                    >
                      {align === "left" ? "Sol" : align === "center" ? "Orta" : "Sağ"}
                    </button>
                  ))}
                </div>
                <label className="block text-xs text-zinc-500">
                  Boyut
                  <NumericInput
                    value={selected.fontSize}
                    onChange={(fontSize) =>
                      updateElement(selected.id, { ...selected, fontSize })
                    }
                    min={10}
                    max={72}
                  />
                </label>
                <label className="block text-xs text-zinc-500">
                  Renk
                  <input
                    type="color"
                    className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-white/10"
                    value={selected.color}
                    onChange={(e) =>
                      updateElement(selected.id, {
                        ...selected,
                        color: e.target.value,
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className={`${btnSecondary} w-full text-xs text-red-200`}
                  onClick={() => {
                    patchElements(doc.elements.filter((e) => e.id !== selected.id));
                    setSelectedId(null);
                  }}
                >
                  Metni sil
                </button>
              </div>
            ) : null}

            <label className="block text-sm">
              <span className="mb-1 block text-xs text-zinc-500">Arka plan görseli</span>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-2 file:py-1.5 file:text-violet-100"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (!f) return;
                  setUploading(true);
                  void uploadInvitationDesignFile(f)
                    .then(({ url }) => patch({ imageUrl: url }))
                    .catch((err) => {
                      logApiError("Bg upload", err);
                      setUploadError(formatUiErrorMessage(err, "Yüklenemedi."));
                    })
                    .finally(() => setUploading(false));
                }}
              />
              {doc.imageUrl ? (
                <button
                  type="button"
                  className={`${btnSecondary} mt-2 text-xs`}
                  onClick={() => patch({ imageUrl: null })}
                >
                  Arka planı kaldır
                </button>
              ) : null}
            </label>
          </div>

          {/* Sağ — önizleme */}
          <div className="md:col-span-1 lg:col-span-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
                Canlı önizleme
              </p>
              <div className="flex rounded-lg border border-white/10 p-0.5 text-xs">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 font-medium ${
                    viewport === "a4"
                      ? "bg-violet-500/30 text-white"
                      : "text-zinc-400"
                  }`}
                  onClick={() => setViewport("a4")}
                >
                  A4 kart
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 font-medium ${
                    viewport === "mobile"
                      ? "bg-violet-500/30 text-white"
                      : "text-zinc-400"
                  }`}
                  onClick={() => setViewport("mobile")}
                >
                  Mobil
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-violet-400/25 bg-[#06040c] p-4 lg:sticky lg:top-2">
              <InvitationCanvasPreview
                document={doc}
                viewport={viewport}
                qrUrls={qrUrls}
                selectedElementId={selectedId}
                onSelectElement={setSelectedId}
                interactive
              />
            </div>
          </div>
        </div>
      </div>

    </InvitationEditorFontProvider>
  );
}
