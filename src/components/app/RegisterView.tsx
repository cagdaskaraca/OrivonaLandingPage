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
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
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
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildCustomerPayload() {
    return {
      fullName,
      email,
      password,
      phone,
    };
  }

  function buildVendorPayload() {
    return {
      fullName,
      email,
      password,
      phoneNumber: phone,
      businessName,
      description,
      city,
      district,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data =
        tab === "customer"
          ? await registerCustomer(buildCustomerPayload())
          : await registerVendor(buildVendorPayload());
      const role =
        getRoleFromUser(data.user) ??
        (tab === "customer" ? "Customer" : "Vendor");
      router.push(getDashboardPathForRole(role));
    } catch (err) {
      console.error("Registration failed", err);
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
      }
      setError(
        formatApiErrorMessage(
          err,
          "Kayıt başarısız. Bilgilerinizi kontrol edin.",
        ),
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
          onClick={() => {
            setTab("customer");
            setError(null);
          }}
        >
          Müşteri Kayıt
        </button>
        <button
          type="button"
          className={tab === "vendor" ? btnPrimary : btnSecondary}
          onClick={() => {
            setTab("vendor");
            setError(null);
          }}
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
            required={tab === "vendor"}
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
              <span className="mb-1.5 block text-xs text-zinc-400">
                Açıklama
              </span>
              <textarea
                className={`${inputClass} min-h-[88px] resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
              <input
                className={inputClass}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
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
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200 whitespace-pre-line">
            {error}
          </div>
        ) : null}
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
