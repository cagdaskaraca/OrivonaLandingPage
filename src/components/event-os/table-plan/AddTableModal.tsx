"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import type { TablePlanTableType } from "@/src/lib/api/types";
import { tableTypeLabel } from "@/src/lib/tablePlan/helpers";
import { btnPrimary, inputClass } from "@/src/lib/ui";

type AddTableModalProps = {
  open: boolean;
  tableType: TablePlanTableType | null;
  defaultName: string;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string, note: string) => void;
};

export function AddTableModal({
  open,
  tableType,
  defaultName,
  saving,
  onClose,
  onSave,
}: AddTableModalProps) {
  const [name, setName] = useState(defaultName);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setNote("");
    }
  }, [open, defaultName]);

  if (!tableType) return null;

  return (
    <Modal open={open} title="Masa / alan ekle" onClose={onClose}>
      <p className="mb-4 text-sm text-zinc-400">
        {tableTypeLabel(tableType)}
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(name.trim() || defaultName, note.trim());
        }}
      >
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">
            Masa / alan adı veya numarası
          </span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Masa 1"
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Not (opsiyonel)</span>
          <input
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="İsteğe bağlı not"
          />
        </label>
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </Modal>
  );
}
