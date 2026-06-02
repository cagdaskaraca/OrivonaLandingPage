"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInvitationDesigns } from "@/src/lib/api/invitationDesigns";
import { logApiError } from "@/src/lib/api/client";
import type { InvitationDesign } from "@/src/lib/api/types";
import { invitationDesignTitle } from "@/src/lib/invitationDesign";
import { selectClass } from "@/src/lib/ui";

/** Taslak seçilmedi; attach / invitationDesignId gönderilmez. */
export function isInvitationDesignSelected(value: string): boolean {
  return value.trim() !== "";
}

type InvitationDesignPickerProps = {
  eventPlanId: string | number | null | undefined;
  value: string;
  onChange: (designId: string) => void;
  disabled?: boolean;
  label?: string;
};

const invitationSelectClass = `${selectClass} appearance-none bg-[#0c0814] pr-10 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.08)] focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20`;

export function InvitationDesignPicker({
  eventPlanId,
  value,
  onChange,
  disabled,
  label = "Davetiye taslağı seç",
}: InvitationDesignPickerProps) {
  const [designs, setDesigns] = useState<InvitationDesign[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (eventPlanId == null) {
      setDesigns([]);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchInvitationDesigns(eventPlanId);
      setDesigns(list);
    } catch (err) {
      logApiError("Invitation designs picker", err);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, [eventPlanId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (eventPlanId == null) {
    return (
      <p className="text-xs text-amber-200/90">
        Davetiye taslağı için önce bir etkinlik planı seçin.
      </p>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-medium text-violet-200/90">
        {label}
      </span>
      <div className="relative">
        <select
          className={invitationSelectClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
        >
          <option value="">Taslak olmadan devam et</option>
          {designs.map((d) =>
            d.id != null ? (
              <option key={String(d.id)} value={String(d.id)}>
                {invitationDesignTitle(d)}
              </option>
            ) : null,
          )}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-violet-300/70"
          aria-hidden
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {loading ? (
        <p className="mt-1.5 text-xs text-zinc-500">Taslaklar yükleniyor…</p>
      ) : null}
      {!loading && designs.length === 0 ? (
        <p className="mt-1.5 text-xs text-zinc-500">
          Bu plan için kayıtlı taslak yok. Müşteri panelinden Davetiye Tasarımı
          bölümünde oluşturabilirsiniz.
        </p>
      ) : null}
    </label>
  );
}
