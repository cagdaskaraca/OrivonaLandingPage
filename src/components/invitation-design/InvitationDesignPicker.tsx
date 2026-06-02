"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInvitationDesigns } from "@/src/lib/api/invitationDesigns";
import { logApiError } from "@/src/lib/api/client";
import type { InvitationDesign } from "@/src/lib/api/types";
import { invitationDesignTitle } from "@/src/lib/invitationDesign";
import { selectClass } from "@/src/lib/ui";

type InvitationDesignPickerProps = {
  eventPlanId: string | number | null | undefined;
  value: string;
  onChange: (designId: string) => void;
  disabled?: boolean;
  label?: string;
};

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
      <span className="mb-1.5 block text-xs text-zinc-400">{label}</span>
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="">Taslak seçmeyin</option>
        {designs.map((d) =>
          d.id != null ? (
            <option key={String(d.id)} value={String(d.id)}>
              {invitationDesignTitle(d)}
            </option>
          ) : null,
        )}
      </select>
      {loading ? (
        <p className="mt-1 text-xs text-zinc-500">Taslaklar yükleniyor…</p>
      ) : null}
      {!loading && designs.length === 0 ? (
        <p className="mt-1 text-xs text-zinc-500">
          Bu plan için taslak yok. Davetiye Tasarımı bölümünden oluşturun.
        </p>
      ) : null}
    </label>
  );
}
