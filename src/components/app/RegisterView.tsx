"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  getDashboardPathForRole,
  getRoleFromUser,
  registerCustomer,
  registerVendor,
} from "@/src/lib/auth";
import { ApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

type Tab = "customer" | "vendor";

export function RegisterView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email,
        password,
        fullName,
        phone,
        ...(tab === "vendor"
          ? { businessName, city }
          : {}),
      };
      const data =
        tab === "customer"
          ? await registerCustomer(payload)
          : await registerVendor(payload);
      const role =
        getRoleFromUser(data.user) ??
        (tab === "customer" ? "Customer" : "Vendor");
      router.push(getDashboardPathForRole(role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Kayıt başarısız. Bilgilerinizi kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DemoShell
      title="Kayıt"
      subtitle="Müşteri veya işletme hesabı oluşturun ve demo panele geçin."
    >
      <div className="mx-auto mb-6 flex max-w-md gap-2">
        <button
          type="button"
          className={tab === "customer" ? btnPrimary : btnSecondary}
          onClick={() => setTab("customer")}
        >
          Müşteri Kayıt
        </button>
        <button
          type="button"
          className={tab === "vendor" ? btnPrimary : btnSecondary}
          onClick={() => setTab("vendor")}
        >
          İşletme Kayıt
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${glassCard} mx-auto max-w-md space-y-4`}
      >
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Ad Soyad</span>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">E-posta</span>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Telefon</span>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {tab === "vendor" ? (
          <>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">
                İşletme adı
              </span>
              <input
                className={inputClass}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
          </>
        ) : null}
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Şifre</span>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
          {loading ? "Kaydediliyor…" : "Kayıt Ol"}
        </button>
        <p className="text-center text-xs text-zinc-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-violet-300 hover:text-white">
            Giriş yapın
          </Link>
        </p>
      </form>
    </DemoShell>
  );
}
