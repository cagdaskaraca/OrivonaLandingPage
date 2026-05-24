"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { useAuth } from "@/src/contexts/AuthContext";
import { getDashboardPathForRole, login } from "@/src/lib/auth";
import { isEmailNotVerifiedError } from "@/src/lib/authEmail";
import { formatLoginError } from "@/src/lib/api/errorMessages";
import { getSafeReturnUrl } from "@/src/lib/authRedirect";
import { ForgotPasswordModal } from "@/src/components/auth/ForgotPasswordModal";
import { EmailField } from "@/src/components/ui/EmailField";
import { isValidEmail } from "@/src/lib/contactValidation";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerificationBlocked, setEmailVerificationBlocked] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    if (!isValidEmail(email)) {
      return;
    }
    setLoading(true);
    setError(null);
    setEmailVerificationBlocked(false);
    try {
      const { role } = await login(email, password);
      if (!role) {
        setError("Kullanıcı rolü tanımlanamadı.");
        return;
      }
      await refresh();
      const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));
      if (returnUrl && role === "Customer") {
        router.push(returnUrl);
      } else {
        router.push(getDashboardPathForRole(role));
      }
    } catch (err) {
      const message = formatLoginError(err);
      if (isEmailNotVerifiedError(err)) {
        setEmailVerificationBlocked(true);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Giriş"
      subtitle="Müşteri, işletme veya yönetici hesabınızla panele erişin."
      centerHeader
    >
      {searchParams.get("unauthorized") ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Oturumunuz sona erdi. Lütfen tekrar giriş yapın.
        </p>
      ) : null}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className={`${glassCard} mx-auto max-w-md space-y-4`}
      >
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
        <div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Şifre</span>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <p className="mt-2 text-right">
            <button
              type="button"
              className="text-xs text-violet-300 hover:text-white"
              onClick={() => setForgotOpen(true)}
            >
              Şifremi unuttum
            </button>
          </p>
        </div>
        {error ? (
          <p
            className={
              emailVerificationBlocked
                ? "rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-3 text-sm leading-relaxed text-violet-100"
                : "text-sm text-red-300"
            }
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={`${btnPrimary} w-full`}
          disabled={loading || !emailValid || !password.trim()}
        >
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
        <p className="text-center text-xs text-zinc-500">
          Hesabınız yok mu?{" "}
          <Link
            href={
              searchParams.get("returnUrl")
                ? `/register?returnUrl=${encodeURIComponent(searchParams.get("returnUrl")!)}`
                : "/register"
            }
            className="text-violet-300 hover:text-white"
          >
            Kayıt olun
          </Link>
        </p>
      </form>
      <ForgotPasswordModal
        open={forgotOpen}
        initialEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </DemoShell>
  );
}
