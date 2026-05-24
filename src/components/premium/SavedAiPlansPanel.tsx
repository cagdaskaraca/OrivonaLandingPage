"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteSavedAiPlan,
  fetchMySavedAiPlans,
  saveAiPlan,
  type SavedAiPlan,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

type SavedAiPlansPanelProps = {
  planPayload: unknown | null;
  onOpenPlan?: (plan: SavedAiPlan) => void;
};

export function SavedAiPlansPanel({
  planPayload,
  onOpenPlan,
}: SavedAiPlansPanelProps) {
  const [plans, setPlans] = useState<SavedAiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchMySavedAiPlans();
      setPlans(list);
    } catch (err) {
      logApiError("Saved AI plans", err);
      if (isApiNotFound(err)) setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (!planPayload) {
      setError("Önce bir plan oluşturun.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveAiPlan(planPayload);
      await load();
    } catch (err) {
      logApiError("Save AI plan", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Plan kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm("Bu planı silmek istiyor musunuz?")) return;
    try {
      await deleteSavedAiPlan(id);
      await load();
    } catch (err) {
      logApiError("Delete saved plan", err);
      setError(formatUiErrorMessage(err, "Plan silinemedi."));
    }
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">Kayıtlı planlar hazırlanıyor.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={btnPrimary}
          disabled={saving || !planPayload}
          onClick={() => void handleSave()}
        >
          {saving ? "Kaydediliyor…" : "Planı Kaydet"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}

      <h3 className="text-sm font-semibold text-violet-200">Kayıtlı Planlarım</h3>
      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-zinc-500">Kayıtlı plan yok.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => (
            <li key={String(plan.id)} className={glassCard}>
              <p className="font-medium text-white">
                {plan.title ?? plan.eventType ?? "Plan"}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {[plan.eventType, plan.city].filter(Boolean).join(" · ")}
              </p>
              {(plan.budget ?? plan.budgetMax) != null ? (
                <p className="mt-1 text-xs text-violet-300">
                  Bütçe:{" "}
                  {new Intl.NumberFormat("tr-TR").format(
                    plan.budget ?? plan.budgetMax ?? 0,
                  )}{" "}
                  ₺
                </p>
              ) : null}
              {plan.createdAt ? (
                <p className="mt-1 text-[10px] text-zinc-600">
                  {new Date(plan.createdAt).toLocaleDateString("tr-TR")}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className={`${btnSecondary} !px-3 !py-1.5 text-xs`}
                  onClick={() => onOpenPlan?.(plan)}
                >
                  Aç
                </button>
                <button
                  type="button"
                  className={`${btnSecondary} !px-3 !py-1.5 text-xs`}
                  onClick={() => void handleDelete(plan.id)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
