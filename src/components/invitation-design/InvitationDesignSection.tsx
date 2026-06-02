"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import { InvitationDesignPreview } from "@/src/components/invitation-design/InvitationDesignPreview";
import { SimpleInvitationEditor } from "@/src/components/invitation-design/SimpleInvitationEditor";
import { AttachInvitationToRequestModal } from "@/src/components/invitation-design/AttachInvitationToRequestModal";
import { InvitationDesignEditorModal } from "@/src/components/invitation-design/InvitationDesignEditorModal";
import {
  createInvitationDesign,
  deleteInvitationDesign,
  fetchInvitationDesigns,
  updateInvitationDesign,
  uploadInvitationDesignFile,
} from "@/src/lib/api/invitationDesigns";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { InvitationDesign, InvitationEditorJson } from "@/src/lib/api/types";
import {
  defaultInvitationEditorJson,
  invitationDesignTitle,
} from "@/src/lib/invitationDesign";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { useToast } from "@/src/contexts/ToastContext";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

type CreateMode = "editor" | "upload" | null;

export function InvitationDesignSection() {
  const toast = useToast();
  const { selectedPlanId } = useEventOs();
  const [designs, setDesigns] = useState<InvitationDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [editing, setEditing] = useState<InvitationDesign | null>(null);
  const [title, setTitle] = useState("Davetiyem");
  const [editorJson, setEditorJson] = useState<InvitationEditorJson>(
    defaultInvitationEditorJson(),
  );
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [attachDesign, setAttachDesign] = useState<InvitationDesign | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | number | null>(null);

  const loadDesigns = useCallback(async (planId: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchInvitationDesigns(planId);
      setDesigns(list);
    } catch (err) {
      logApiError("Invitation designs", err);
      setDesigns([]);
      setError(formatUiErrorMessage(err, "Tasarımlar yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPlanId != null) {
      setActivePlanId(selectedPlanId);
      void loadDesigns(selectedPlanId);
    }
  }, [selectedPlanId, loadDesigns]);

  function openCreate(mode: CreateMode) {
    setEditing(null);
    setCreateMode(mode);
    setTitle("Davetiyem");
    setEditorJson(defaultInvitationEditorJson());
    setUploadFile(null);
  }

  function openEdit(design: InvitationDesign) {
    setEditing(design);
    setCreateMode(design.sourceType === "Upload" ? "upload" : "editor");
    setTitle(invitationDesignTitle(design));
    if (design.sourceType === "Editor") {
      const parsed =
        typeof design.designJson === "object" && design.designJson
          ? design.designJson
          : defaultInvitationEditorJson();
      setEditorJson(parsed as InvitationEditorJson);
    }
    setUploadFile(null);
  }

  function closeModal() {
    setCreateMode(null);
    setEditing(null);
    setUploadFile(null);
  }

  async function handleSave(planId: string | number) {
    setSaving(true);
    setError(null);
    try {
      if (createMode === "upload") {
        if (!uploadFile && !editing?.fileUrl) {
          setError("Lütfen bir görsel veya PDF seçin.");
          setSaving(false);
          return;
        }
        let fileUrl = editing?.fileUrl;
        let fileName = editing?.fileName;
        let mimeType = editing?.mimeType;
        if (uploadFile) {
          const uploaded = await uploadInvitationDesignFile(uploadFile);
          fileUrl = uploaded.url;
          fileName = uploaded.fileName;
          mimeType = uploaded.mimeType;
        }
        const payload = {
          title: title.trim() || "Yüklenen davetiye",
          sourceType: "Upload" as const,
          status: "Ready",
          fileUrl,
          fileName,
          mimeType,
        };
        if (editing?.id != null) {
          await updateInvitationDesign(planId, editing.id, payload);
          toast.success("Tasarım güncellendi.");
        } else {
          await createInvitationDesign(planId, payload);
          toast.success("Dosya yüklendi ve kaydedildi.");
        }
      } else if (createMode === "editor") {
        const payload = {
          title: title.trim() || "Davetiye tasarımı",
          sourceType: "Editor" as const,
          status: "Ready",
          designJson: JSON.stringify(editorJson),
        };
        if (editing?.id != null) {
          await updateInvitationDesign(planId, editing.id, payload);
          toast.success("Tasarım güncellendi.");
        } else {
          await createInvitationDesign(planId, payload);
          toast.success("Tasarım kaydedildi.");
        }
      }
      closeModal();
      await loadDesigns(planId);
    } catch (err) {
      logApiError("Save invitation design", err);
      setError(formatUiErrorMessage(err, "Kayıt başarısız."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(planId: string | number, design: InvitationDesign) {
    if (design.id == null) return;
    if (!window.confirm(`"${invitationDesignTitle(design)}" silinsin mi?`)) return;
    setDeletingId(design.id);
    try {
      await deleteInvitationDesign(planId, design.id);
      toast.success("Tasarım silindi.");
      await loadDesigns(planId);
    } catch (err) {
      logApiError("Delete invitation design", err);
      toast.error(formatUiErrorMessage(err, "Silinemedi."));
    } finally {
      setDeletingId(null);
    }
  }

  const modalOpen = createMode != null;

  return (
    <div className={`${glassCard}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Davetiye Tasarımı</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Basit editör veya dosya yükleyerek davetiye hazırlayın; teklif
            talebinize ekleyin.
          </p>
        </div>
        <EventOsPlanPicker className="min-w-[200px] flex-1 sm:max-w-xs" />
      </div>

      <EventOsNeedPlan>
        {(planId) => (
          <InvitationDesignPlanContent
            designs={designs}
            loading={loading}
            error={error}
            deletingId={deletingId}
            onRefresh={() => void loadDesigns(planId)}
            onOpenCreate={openCreate}
            onOpenEdit={openEdit}
            onDelete={(d) => void handleDelete(planId, d)}
            onAttach={setAttachDesign}
          />
        )}
      </EventOsNeedPlan>

      <InvitationDesignEditorModal
        open={modalOpen}
        title={
          editing
            ? "Davetiye tasarımını düzenle"
            : createMode === "upload"
              ? "Dosya yükle"
              : "Davetiye tasarla"
        }
        onClose={saving ? undefined : closeModal}
        footer={
          activePlanId != null ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={`${btnSecondary} w-full sm:w-auto`}
                onClick={closeModal}
                disabled={saving}
              >
                İptal
              </button>
              <button
                type="button"
                className={`${btnPrimary} w-full sm:w-auto`}
                disabled={saving}
                onClick={() => void handleSave(activePlanId)}
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          ) : null
        }
      >
        {activePlanId != null ? (
          <div className="space-y-4">
            {createMode === "editor" ? (
              <SimpleInvitationEditor
                designTitle={title}
                onDesignTitleChange={setTitle}
                value={editorJson}
                onChange={setEditorJson}
              />
            ) : (
              <>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">
                    Tasarım adı
                  </span>
                  <input
                    className={inputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">
                    Görsel veya PDF
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  {editing?.fileUrl && !uploadFile ? (
                    <p className="mt-2 text-xs text-zinc-500">
                      Mevcut dosya korunur; yeni dosya seçerseniz değişir.
                    </p>
                  ) : null}
                </label>
              </>
            )}
            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Önce bir etkinlik planı seçin.</p>
        )}
      </InvitationDesignEditorModal>

      <AttachInvitationToRequestModal
        design={attachDesign}
        open={attachDesign != null}
        onClose={() => setAttachDesign(null)}
        onSuccess={() => toast.success("Tasarım etkinlik talebine eklendi.")}
      />
    </div>
  );
}

function InvitationDesignPlanContent({
  designs,
  loading,
  error,
  deletingId,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onAttach,
}: {
  designs: InvitationDesign[];
  loading: boolean;
  error: string | null;
  deletingId: string | number | null;
  onRefresh: () => void;
  onOpenCreate: (mode: CreateMode) => void;
  onOpenEdit: (design: InvitationDesign) => void;
  onDelete: (design: InvitationDesign) => void;
  onAttach: (design: InvitationDesign) => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={btnPrimary}
          onClick={() => onOpenCreate("editor")}
        >
          Basit editörle tasarla
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => onOpenCreate("upload")}
        >
          Dosya yükle
        </button>
        <button type="button" className={`${btnSecondary} text-xs`} onClick={onRefresh}>
          Yenile
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Tasarımlar yükleniyor…</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!loading && designs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-violet-400/25 px-4 py-8 text-center text-sm text-zinc-500">
          Bu plan için henüz davetiye tasarımı yok. Yukarıdan oluşturun.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {designs.map((design) => (
            <li
              key={String(design.id)}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <InvitationDesignPreview design={design} compact />
              <p className="mt-3 font-medium text-white">
                {invitationDesignTitle(design)}
              </p>
              <div className="mt-2">
                <StatusBadge status={design.status} context="customer" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${btnSecondary} px-3 py-1.5 text-xs`}
                  onClick={() => onOpenEdit(design)}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} px-3 py-1.5 text-xs`}
                  onClick={() => onDelete(design)}
                  disabled={deletingId === design.id}
                >
                  {deletingId === design.id ? "Siliniyor…" : "Sil"}
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} px-3 py-1.5 text-xs`}
                  onClick={() => onAttach(design)}
                >
                  Teklif talebine ekle
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
