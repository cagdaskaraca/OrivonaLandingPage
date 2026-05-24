"use client";

import Link from "next/link";
import { Modal } from "@/src/components/ui/Modal";
import { buildLoginUrl, buildRegisterUrl } from "@/src/lib/authRedirect";
import { btnPrimary, btnSecondary } from "@/src/lib/ui";

export type CustomerAuthPromptReason = "login" | "wrong_role";

type CustomerAuthPromptModalProps = {
  open: boolean;
  reason: CustomerAuthPromptReason;
  returnUrl: string;
  onClose: () => void;
};

export function CustomerAuthPromptModal({
  open,
  reason,
  returnUrl,
  onClose,
}: CustomerAuthPromptModalProps) {
  const loginHref = buildLoginUrl(returnUrl);
  const registerHref = buildRegisterUrl(returnUrl);

  const title =
    reason === "wrong_role" ? "Müşteri hesabı gerekli" : "Giriş gerekli";

  const message =
    reason === "wrong_role"
      ? "Bu işlem yalnızca müşteri hesabıyla yapılabilir."
      : "Bu işlem için giriş yapmanız gerekiyor.";

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-zinc-300">{message}</p>
      {reason === "login" ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href={loginHref} className={`${btnPrimary} text-center`}>
            Giriş Yap
          </Link>
          <Link href={registerHref} className={`${btnSecondary} text-center`}>
            Kayıt Ol
          </Link>
        </div>
      ) : (
        <button type="button" className={`${btnSecondary} mt-6 w-full`} onClick={onClose}>
          Tamam
        </button>
      )}
    </Modal>
  );
}
