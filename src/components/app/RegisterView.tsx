"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getDashboardPathForRole,
  getRoleFromUser,
  registerCustomer,
  registerVendor,
} from "@/src/lib/auth";
import {
  EMAIL_VERIFICATION_COMING_SOON,
  isEmailNotVerifiedError,
  sendEmailVerification,
  verifyEmail,
} from "@/src/lib/authEmail";
import { resolvePostAuthRedirectUrl } from "@/src/lib/authRedirect";
import { ApiError, formatUiErrorMessage } from "@/src/lib/api/client";
import {
  VENDOR_COMPANY_TYPES,
  VENDOR_IDENTITY_UX_NOTE,
  type VendorCompanyType,
} from "@/src/lib/vendorIdentity";
import { KvkkConsentField } from "@/src/components/auth/KvkkConsentField";
import {
  ConfirmPasswordField,
  PasswordStrengthField,
} from "@/src/components/auth/PasswordStrengthField";
import { EmailField } from "@/src/components/ui/EmailField";
import { PhoneField } from "@/src/components/ui/PhoneField";
import { isValidEmail, isValidStoredPhone } from "@/src/lib/contactValidation";
import {
  isPasswordPolicyMet,
  passwordsMatch,
} from "@/src/lib/passwordPolicy";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

type Tab = "customer" | "vendor";
type Step = "form" | "verify";

export function RegisterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [tab, setTab] = useState<Tab>("customer");
  const [step, setStep] = useState<Step>("form");

  useEffect(() => {
    if (searchParams.get("type") === "vendor") setTab("vendor");
    const verifyEmailParam = searchParams.get("verifyEmail");
    if (verifyEmailParam) {
      setEmail(verifyEmailParam);
      setStep("verify");
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [companyType, setCompanyType] = useState<VendorCompanyType>("Sahis");
  const [taxNumber, setTaxNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredRole, setRegisteredRole] = useState<"Customer" | "Vendor">(
    "Customer",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);

  const phoneRequired = tab === "vendor";
  const vendorFieldsOk =
    tab !== "vendor" ||
    (businessName.trim() &&
      legalBusinessName.trim() &&
      description.trim() &&
      city.trim() &&
      district.trim());
  const passwordsOk = passwordsMatch(password, confirmPassword) && confirmPassword.length > 0;
  const canSubmit =
    Boolean(fullName.trim()) &&
    emailValid &&
    isPasswordPolicyMet(password) &&
    passwordsOk &&
    phoneValid &&
    vendorFieldsOk &&
    kvkkAccepted;

  function buildCustomerPayload() {
    const payload: Record<string, unknown> = {
      fullName,
      email: email.trim(),
      password,
      kvkkAccepted: true,
    };
    if (phone.trim()) payload.phone = phone.trim();
    return payload;
  }

  function buildVendorPayload() {
    const payload: Record<string, unknown> = {
      fullName,
      email: email.trim(),
      password,
      phoneNumber: phone.trim(),
      businessName,
      description,
      city,
      district,
      kvkkAccepted: true,
    };
    if (legalBusinessName.trim()) payload.legalBusinessName = legalBusinessName.trim();
    if (companyType) payload.companyType = companyType;
    if (taxNumber.trim()) payload.taxNumber = taxNumber.trim();
    if (nationalId.trim()) payload.nationalId = nationalId.trim();
    return payload;
  }

  async function finishAuthRedirect(role: "Customer" | "Vendor") {
    await refresh();
    const returnUrl = resolvePostAuthRedirectUrl(
      searchParams.get("returnUrl"),
    );
    if (returnUrl && role === "Customer") {
      router.push(returnUrl);
    } else {
      router.push(getDashboardPathForRole(role));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    if (
      !isValidEmail(email) ||
      !isValidStoredPhone(phone, phoneRequired) ||
      !isPasswordPolicyMet(password) ||
      !passwordsMatch(password, confirmPassword) ||
      !kvkkAccepted
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data =
        tab === "customer"
          ? await registerCustomer(buildCustomerPayload())
          : await registerVendor(buildVendorPayload());
      const roleRaw =
        getRoleFromUser(data.user) ??
        (tab === "customer" ? "Customer" : "Vendor");
      const role: "Customer" | "Vendor" =
        roleRaw === "Vendor" ? "Vendor" : "Customer";
      setRegisteredRole(role);
      await finishAuthRedirect(role);
    } catch (err) {
      console.error("Registration failed", err);
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
      }
      if (isEmailNotVerifiedError(err)) {
        setError(EMAIL_VERIFICATION_COMING_SOON);
      } else {
        setError(
          formatUiErrorMessage(
            err,
            "Kayıt başarısız. Bilgilerinizi kontrol edin.",
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await verifyEmail({ email, code: verificationCode });
      setSuccess("E-posta adresiniz doğrulandı.");
      await finishAuthRedirect(registeredRole);
    } catch (err) {
      setError(
        formatUiErrorMessage(err, "Doğrulama kodu geçersiz veya süresi dolmuş."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(email);
      setSuccess("Doğrulama kodu tekrar gönderildi.");
    } catch (err) {
      setError(formatUiErrorMessage(err, "Kod gönderilemedi."));
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <DemoShell
        title="E-posta doğrulama"
        subtitle="Hesabınızı etkinleştirmek için gelen kodu girin."
        centerHeader
      >
        <form
          onSubmit={(e) => void handleVerify(e)}
          className={`${glassCard} mx-auto max-w-md space-y-4`}
        >
          <p className="text-sm text-emerald-200/90">
            E-posta doğrulama kodu gönderildi.
          </p>
          <p className="text-xs text-zinc-500">
            <span className="text-zinc-300">{email}</span> adresine gelen 6 haneli
            kodu girin.
          </p>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Doğrulama kodu</span>
            <input
              className={inputClass}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </label>
          {success ? (
            <p className="text-sm text-emerald-300/90">{success}</p>
          ) : null}
          {error ? (
            <p className="whitespace-pre-line text-sm text-red-300">{error}</p>
          ) : null}
          <button type="submit" className={`${btnPrimary} w-full`} disabled={loading}>
            {loading ? "Doğrulanıyor…" : "E-postayı doğrula"}
          </button>
          <button
            type="button"
            className={`${btnSecondary} w-full`}
            disabled={loading || !email.trim()}
            onClick={() => void handleResendCode()}
          >
            Kodu tekrar gönder
          </button>
          <p className="text-center text-xs text-zinc-500">
            <Link href="/login" className="text-violet-300 hover:text-white">
              Giriş sayfasına dön
            </Link>
          </p>
        </form>
      </DemoShell>
    );
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
        onSubmit={(e) => void handleSubmit(e)}
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
          <EmailField
            value={email}
            onChange={setEmail}
            required
            showValidation={showValidation}
            onValidityChange={setEmailValid}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Telefon</span>
          <PhoneField
            value={phone}
            onChange={setPhone}
            required={phoneRequired}
            showValidation={showValidation}
            onValidityChange={setPhoneValid}
          />
        </label>
        {tab === "vendor" ? (
          <>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">
                İşletme adı (görünen)
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
                İşletmenin yasal adı
              </span>
              <input
                className={inputClass}
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">İşletme türü</span>
              <select
                className={selectClass}
                value={companyType}
                onChange={(e) =>
                  setCompanyType(e.target.value as VendorCompanyType)
                }
                required
              >
                {VENDOR_COMPANY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Vergi numarası</span>
              <input
                className={inputClass}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="10 haneli vergi no"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">
                İşletmeci T.C. kimlik numarası
              </span>
              <input
                className={inputClass}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="11 haneli T.C. kimlik no"
                inputMode="numeric"
              />
            </label>
            <p className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs leading-relaxed text-zinc-400">
              {VENDOR_IDENTITY_UX_NOTE}
            </p>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
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
        <div className="block text-sm">
          <PasswordStrengthField value={password} onChange={setPassword} />
        </div>
        <ConfirmPasswordField
          value={confirmPassword}
          onChange={setConfirmPassword}
          password={password}
          showValidation={showValidation}
        />
        <KvkkConsentField checked={kvkkAccepted} onChange={setKvkkAccepted} />
        {error ? (
          <div className="whitespace-pre-line rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          className={`${btnPrimary} w-full`}
          disabled={loading || !canSubmit}
        >
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
