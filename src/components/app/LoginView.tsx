"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  getDashboardPathForRole,
  login,
} from "@/src/lib/auth";
import { ApiError } from "@/src/lib/api/client";
import { btnPrimary, glassCard, inputClass } from "@/src/lib/ui";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { role } = await login(email, password);
      if (!role) {
        setError("Kullanıcı rolü tanımlanamadı.");
        return;
      }
      router.push(getDashboardPathForRole(role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Giriş başarısız. Bilgilerinizi kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Giriş"
      subtitle="Müşteri, işletme veya yönetici hesabınızla panele erişin."
    >
      {searchParams.get("unauthorized") ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Oturumunuz sona erdi. Lütfen tekrar giriş yapın.
        </p>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className={`${glassCard} mx-auto max-w-md space-y-4`}
      >
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">E-posta</span>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
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
        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : null}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
          {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
        <p className="text-center text-xs text-zinc-500">
          Hesabınız yok mu?{" "}
          <Link href="/register" className="text-violet-300 hover:text-white">
            Kayıt olun
          </Link>
        </p>
      </form>
    </DemoShell>
  );
}
