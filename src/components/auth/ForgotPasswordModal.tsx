"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { EmailField } from "@/src/components/ui/EmailField";
import {
  FORGOT_PASSWORD_COMING_SOON,
  requestForgotPassword,
} from "@/src/lib/authEmail";
import { isValidEmail } from "@/src/lib/contactValidation";
import { btnPrimary } from "@/src/lib/ui";

type ForgotPasswordModalProps = {
  open: boolean;
  initialEmail?: string;
  onClose: () => void;
};

export function ForgotPasswordModal({
  open,
  initialEmail = "",
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    if (open) setEmail(initialEmail);
  }, [open, initialEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    if (!isValidEmail(email)) return;

    setLoading(true);
    setMessage(null);
    try {
      const text = await requestForgotPassword(email);
      setMessage(text);
    } catch {
      setMessage(FORGOT_PASSWORD_COMING_SOON);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMessage(null);
    setShowValidation(false);
    onClose();
  }

  return (
    <Modal open={open} title="Şifremi unuttum" onClose={handleClose}>
      <p className="mb-4 text-sm leading-relaxed text-zinc-400">
        Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı gönderilecektir.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">E-posta</span>
          <EmailField
            value={email}
            onChange={setEmail}
            required
            showValidation={showValidation}
            onValidityChange={setEmailValid}
          />
        </label>
        {message ? (
          <p className="rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm leading-relaxed text-violet-100">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          className={`${btnPrimary} w-full`}
          disabled={loading || !emailValid}
        >
          {loading ? "Gönderiliyor…" : "Sıfırlama isteği gönder"}
        </button>
      </form>
    </Modal>
  );
}
