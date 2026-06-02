"use client";

import { useCallback, useMemo, useState } from "react";
import { ImagePlus, QrCode, Type } from "lucide-react";
import { InvitationCanvasPreview } from "@/src/components/invitation-design/editor/InvitationCanvasPreview";
import { InvitationDragCanvas } from "@/src/components/invitation-design/editor/InvitationDragCanvas";
import { InvitationEditorFontProvider } from "@/src/components/invitation-design/editor/InvitationEditorFontProvider";
import { InvitationObjectInspector } from "@/src/components/invitation-design/editor/InvitationObjectInspector";
import { InvitationStudioSelect } from "@/src/components/invitation-design/editor/InvitationStudioSelect";
import { useIsMobileLayout } from "@/src/hooks/useIsMobileLayout";
import { uploadInvitationDesignFile } from "@/src/lib/api/invitationDesigns";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import {
  canDeleteElement,
  deleteElementFromDoc,
} from "@/src/lib/invitationEditor/canvasOps";
import { finalizeDocument } from "@/src/lib/invitationEditor/document";
import { INVITATION_FONT_OPTIONS } from "@/src/lib/invitationEditor/fonts";
import {
  CORE_LAYOUT_IDS,
  LAYOUT_CANVAS_HEIGHT,
  LAYOUT_CANVAS_WIDTH,
  newLayoutId,
  updateLayoutElement,
} from "@/src/lib/invitationEditor/layout";
import {
  createShapeElement,
  SHAPE_TOOLS,
} from "@/src/lib/invitationEditor/shapes";
import {
  applyTemplateToDocument,
  INVITATION_TEMPLATES,
} from "@/src/lib/invitationEditor/templates";
import type {
  InvitationEditorDocument,
  InvitationFontId,
  InvitationQrUrls,
  InvitationTemplateId,
  LayoutElement,
  PreviewViewport,
  ShapeType,
} from "@/src/lib/invitationEditor/types";
import { inputClass } from "@/src/lib/ui";
import "./invitation-studio.css";

type CanvaInvitationEditorProps = {
  designTitle: string;
  onDesignTitleChange: (value: string) => void;
  document: InvitationEditorDocument;
  onChange: (next: InvitationEditorDocument) => void;
  qrUrls?: InvitationQrUrls;
};

const toolBtn =
  "flex w-full items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2.5 text-left text-sm text-violet-100 transition-colors hover:border-violet-400/45 hover:bg-violet-500/20";

export function CanvaInvitationEditor({
  designTitle,
  onDesignTitleChange,
  document: doc,
  onChange,
  qrUrls = {},
}: CanvaInvitationEditorProps) {
  const isMobile = useIsMobileLayout();
  const [viewport, setViewport] = useState<PreviewViewport>("a4");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shapeOffset, setShapeOffset] = useState(0);

  const docFinal = useMemo(() => finalizeDocument(doc), [doc]);

  const selected = useMemo(
    () => docFinal.layoutJson.elements.find((e) => e.id === selectedId),
    [docFinal.layoutJson.elements, selectedId],
  );

  const commit = useCallback(
    (next: InvitationEditorDocument) => {
      onChange(finalizeDocument(next));
    },
    [onChange],
  );

  const patch = useCallback(
    (partial: Partial<InvitationEditorDocument>) => {
      commit({ ...docFinal, ...partial });
    },
    [commit, docFinal],
  );

  const patchFields = useCallback(
    (fields: Partial<InvitationEditorDocument["fields"]>) => {
      commit({
        ...docFinal,
        fields: { ...docFinal.fields, ...fields },
      });
    },
    [commit, docFinal],
  );

  const patchLayout = useCallback(
    (updater: (elements: LayoutElement[]) => LayoutElement[]) => {
      commit({
        ...docFinal,
        layoutJson: {
          ...docFinal.layoutJson,
          elements: updater(docFinal.layoutJson.elements),
        },
      });
    },
    [commit, docFinal],
  );

  const updateElement = useCallback(
    (id: string, patchEl: Partial<LayoutElement>) => {
      commit({
        ...docFinal,
        layoutJson: updateLayoutElement(docFinal.layoutJson, id, patchEl),
      });
    },
    [commit, docFinal],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const next = deleteElementFromDoc(docFinal, selectedId);
    commit(next);
    setSelectedId(null);
  }, [commit, docFinal, selectedId]);

  function applyTemplate(templateId: InvitationTemplateId) {
    commit(applyTemplateToDocument(docFinal, templateId));
  }

  function addText() {
    const el: LayoutElement = {
      id: newLayoutId(),
      type: "text",
      x: 80,
      y: 360,
      width: 260,
      height: 48,
      content: "Yeni metin",
      fontSize: 16,
      color: docFinal.textColor,
      fontFamily: docFinal.fontFamily,
      bold: false,
      italic: false,
      align: "center",
      zIndex: docFinal.layoutJson.elements.length + 1,
    };
    patchLayout((els) => [...els, el]);
    setSelectedId(el.id);
  }

  async function addImage(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadInvitationDesignFile(file);
      const hasImage = docFinal.layoutJson.elements.some(
        (e) => e.id === CORE_LAYOUT_IDS.image,
      );
      if (hasImage) {
        updateElement(CORE_LAYOUT_IDS.image, { url, hidden: false });
      } else {
        patchLayout((els) => [
          ...els,
          {
            id: CORE_LAYOUT_IDS.image,
            type: "image",
            x: 110,
            y: 380,
            width: 200,
            height: 120,
            url,
            zIndex: 20,
          },
        ]);
      }
      patch({ imageUrl: url });
      setSelectedId(CORE_LAYOUT_IDS.image);
    } catch (err) {
      logApiError("Editor image upload", err);
      setUploadError(formatUiErrorMessage(err, "Görsel yüklenemedi."));
    } finally {
      setUploading(false);
    }
  }

  function addShape(shapeType: ShapeType) {
    const offset = { x: shapeOffset % 48, y: shapeOffset % 48 };
    const el = createShapeElement(shapeType, docFinal, offset);
    setShapeOffset((n) => n + 16);
    patchLayout((els) => [...els, el]);
    setSelectedId(el.id);
  }

  function addQrElement() {
    patch({
      qr: { ...docFinal.qr, enabled: true },
    });
    const hasQr = docFinal.layoutJson.elements.some(
      (e) => e.id === CORE_LAYOUT_IDS.qr,
    );
    if (hasQr) {
      updateElement(CORE_LAYOUT_IDS.qr, { hidden: false });
    }
    setSelectedId(CORE_LAYOUT_IDS.qr);
  }

  function addIcon(icon: "heart" | "rings" | "star" | "flower") {
    const el: LayoutElement = {
      id: newLayoutId(),
      type: "icon",
      icon,
      x: 180,
      y: 48,
      width: 48,
      height: 48,
      color: docFinal.accentColor,
      zIndex: docFinal.layoutJson.elements.length + 1,
    };
    patchLayout((els) => [...els, el]);
    setSelectedId(el.id);
  }

  const qrSourceOptions = [
    {
      value: "invite",
      label: "Ortak Davet Linki",
      disabled: !qrUrls.inviteUrl,
    },
    {
      value: "publicPage",
      label: "Herkese Açık Etkinlik Sayfası",
      disabled: !qrUrls.publicPageUrl,
    },
  ].filter((o) => !o.disabled);

  const desktopScale = Math.min(1, 340 / LAYOUT_CANVAS_WIDTH);

  return (
    <InvitationEditorFontProvider>
      <div className="space-y-5">
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
                  docFinal.templateId === t.id
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

        {isMobile ? (
          <p className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-100/90">
            Mobilde yalnızca önizleme gösterilir. Konumlandırma için masaüstü
            kullanın.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
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
                  value={docFinal.fields[key]}
                  onChange={(e) => patchFields({ [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-zinc-500">Açıklama</span>
              <textarea
                className={`${inputClass} min-h-[72px] resize-y`}
                value={docFinal.fields.notes}
                onChange={(e) => patchFields({ notes: e.target.value })}
              />
            </label>
          </aside>

          <div className="hidden space-y-4 md:col-span-1 md:block lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
              Tasarım araçları
            </p>
            <div className="grid gap-2 lg:grid-cols-1">
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
              <button type="button" className={toolBtn} onClick={addQrElement}>
                <QrCode size={18} /> QR kod ekle
              </button>
              <div className="flex flex-wrap gap-1.5">
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
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-400">Şekiller</p>
              <div className="invitation-shape-grid">
                {SHAPE_TOOLS.map((tool) => (
                  <button
                    key={tool.shapeType}
                    type="button"
                    className="invitation-shape-chip"
                    title={tool.label}
                    onClick={() => addShape(tool.shapeType)}
                  >
                    <span aria-hidden>{tool.symbol}</span>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {uploadError ? (
              <p className="text-xs text-red-300">{uploadError}</p>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-400">
                Varsayılan font
              </p>
              <InvitationStudioSelect
                value={docFinal.fontFamily}
                options={INVITATION_FONT_OPTIONS.map((f) => ({
                  value: f.id,
                  label: f.label,
                }))}
                onChange={(v) =>
                  patch({ fontFamily: v as InvitationFontId })
                }
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-xs font-semibold text-zinc-400">QR kod</p>
              <label className="mb-2 flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={docFinal.qr.enabled}
                  onChange={(e) =>
                    patch({ qr: { ...docFinal.qr, enabled: e.target.checked } })
                  }
                />
                QR göster
              </label>
              {qrSourceOptions.length > 0 ? (
                <InvitationStudioSelect
                  value={docFinal.qr.source}
                  options={qrSourceOptions.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                  onChange={(v) =>
                    patch({
                      qr: {
                        ...docFinal.qr,
                        source: v as "invite" | "publicPage",
                      },
                    })
                  }
                />
              ) : (
                <p className="text-xs text-zinc-500">
                  QR için davet veya herkese açık sayfa linki gerekir.
                </p>
              )}
            </div>

            {selected ? (
              <InvitationObjectInspector
                selected={selected}
                doc={docFinal}
                onUpdate={updateElement}
                onDelete={deleteSelected}
                canDelete={canDeleteElement(selected)}
              />
            ) : null}

            <label className="block text-sm">
              <span className="mb-1 block text-xs text-zinc-500">
                Arka plan görseli
              </span>
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
            </label>
          </div>

          <div className="md:col-span-2 lg:col-span-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/90">
                {isMobile ? "Önizleme" : "Çalışma alanı"}
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
                  A4
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
              {isMobile ? (
                <InvitationCanvasPreview
                  document={docFinal}
                  viewport={viewport}
                  qrUrls={qrUrls}
                />
              ) : (
                <InvitationDragCanvas
                  document={docFinal}
                  qrUrls={qrUrls}
                  selectedElementId={selectedId}
                  onSelectElement={setSelectedId}
                  onChange={commit}
                  scale={desktopScale}
                />
              )}
            </div>
            {!isMobile ? (
              <p className="mt-2 text-center text-[10px] text-zinc-500">
                Sürükle · boyutlandır · Delete ile sil ·{" "}
                {LAYOUT_CANVAS_WIDTH}×{LAYOUT_CANVAS_HEIGHT}px
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </InvitationEditorFontProvider>
  );
}
