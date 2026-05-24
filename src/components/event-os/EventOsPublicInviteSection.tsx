"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EventOsError,
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  createEventPlanPublicInvite,
  disableEventPlanPublicInvite,
  fetchEventPlanPublicInvite,
} from "@/src/lib/api/publicEventInvite";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { PublicEventInvite } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { planDisplayTitle } from "@/src/lib/invites";
import {
  resolvePublicInviteUrl,
  shareInviteViaWhatsApp,
} from "@/src/lib/invites";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

function PublicInvitePanel({ planId }: { planId: string | number }) {
  const { selectedPlan } = useEventOs();
  const toast = useToast();
  const [invite, setInvite] = useState<PublicEventInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const inviteUrl = resolvePublicInviteUrl(invite ?? {});
  const isActive =
    invite?.isActive !== false && invite?.disabled !== true && !!inviteUrl;
  const eventTitle = planDisplayTitle(selectedPlan);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEventPlanPublicInvite(planId);
      setInvite(data);
      if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
    } catch (err) {
      logApiError("Public invite load", err);
      setInvite(null);
      setError(formatUiErrorMessage(err, "Davet linki yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const data = await createEventPlanPublicInvite(
        planId,
        welcomeMessage.trim() || undefined,
      );
      setInvite(data);
      toast.success("Ortak davet linki oluşturuldu.");
    } catch (err) {
      logApiError("Create public invite", err);
      setError(formatUiErrorMessage(err, "Link oluşturulamadı."));
    } finally {
      setCreating(false);
    }
  }

  async function handleDisable() {
    if (!confirm("Ortak davet linkini devre dışı bırakmak istediğinize emin misiniz?")) {
      return;
    }
    setDisabling(true);
    try {
      await disableEventPlanPublicInvite(planId);
      setInvite((prev) => ({ ...prev, isActive: false, disabled: true }));
      toast.success("Davet linki devre dışı bırakıldı.");
    } catch (err) {
      logApiError("Disable public invite", err);
      toast.error(formatUiErrorMessage(err, "Devre dışı bırakılamadı."));
    } finally {
      setDisabling(false);
    }
  }

  async function copyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Link kopyalanamadı.");
    }
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />
      <p className="text-sm text-zinc-400">
        Misafirleriniz e-posta olmadan bu ortak linkten ad, telefon veya e-posta ile
        kendilerini doğrulayıp katılım yanıtı verebilir ve QR bilet alabilir.
      </p>

      {error ? <EventOsError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : !inviteUrl || !isActive ? (
        <div className="space-y-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-zinc-400">
              Karşılama mesajı (isteğe bağlı)
            </span>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Etkinliğimize hoş geldiniz…"
              disabled={creating}
            />
          </label>
          <button
            type="button"
            className={btnPrimary}
            disabled={creating}
            onClick={() => void handleCreate()}
          >
            {creating ? "Oluşturuluyor…" : "Davet linki oluştur"}
          </button>
          {invite?.disabled ? (
            <p className="text-xs text-amber-200/90">
              Önceki link devre dışı. Yeni link oluşturabilirsiniz.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Aktif davet linki
          </p>
          <p className="break-all text-sm text-zinc-200">{inviteUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => void copyLink()}
            >
              {copied ? "Kopyalandı ✓" : "Linki kopyala"}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => shareInviteViaWhatsApp(inviteUrl, eventTitle)}
            >
              WhatsApp ile paylaş
            </button>
            <button
              type="button"
              className={`${btnSecondary} border-red-400/30 text-red-200 hover:bg-red-500/10`}
              disabled={disabling}
              onClick={() => void handleDisable()}
            >
              {disabling ? "…" : "Devre dışı bırak"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EventOsPublicInviteSection() {
  return (
    <EventOsNeedPlan>
      {(planId) => <PublicInvitePanel planId={planId} />}
    </EventOsNeedPlan>
  );
}
