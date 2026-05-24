"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  completeEventWizard,
  type EventWizardPayload,
  type EventWizardResult,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

const STEPS = [
  { key: "eventType", label: "Etkinlik tipi" },
  { key: "date", label: "Tarih" },
  { key: "location", label: "Lokasyon" },
  { key: "guests", label: "Kişi sayısı" },
  { key: "budget", label: "Bütçe" },
  { key: "style", label: "Stil" },
  { key: "categories", label: "Kategoriler" },
] as const;

const EVENT_TYPES = ["Düğün", "Nişan", "Doğum günü", "Kurumsal", "Diğer"];
const STYLES = ["Klasik", "Modern", "Rustik", "Bohem", "Minimal"];

function WizardContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState("Düğün");
  const [eventDate, setEventDate] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [guestCount, setGuestCount] = useState(100);
  const [budgetMin, setBudgetMin] = useState(100000);
  const [budgetMax, setBudgetMax] = useState(300000);
  const [style, setStyle] = useState("Klasik");
  const [categories, setCategories] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EventWizardResult | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const payload: EventWizardPayload = {
    eventType,
    eventDate,
    city,
    district,
    guestCount,
    budgetMin,
    budgetMax,
    style,
    categories: categories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      const res = await completeEventWizard(payload);
      if (!res) {
        setUnavailable(true);
        return;
      }
      setResult(res);
    } catch (err) {
      logApiError("Event wizard", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Sihirbaz tamamlanamadı."));
    } finally {
      setLoading(false);
    }
  }

  if (unavailable) {
    return (
      <DemoShell title="Etkinlik Sihirbazı" subtitle="AI destekli plan oluşturma">
        <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>
        <Link href="/customer/dashboard" className={`${btnSecondary} mt-4 inline-flex`}>
          Dashboard&apos;a dön
        </Link>
      </DemoShell>
    );
  }

  if (result) {
    return (
      <DemoShell title="Planınız hazır" subtitle="AI etkinlik planı oluşturuldu">
        <div className={`${glassCard} space-y-4`}>
          {result.eventPlanId != null ? (
            <p className="text-sm text-zinc-400">
              Etkinlik planı #{String(result.eventPlanId)} oluşturuldu.
            </p>
          ) : null}
          {result.tasks && Array.isArray(result.tasks) && result.tasks.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-violet-200">Checklist</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {(result.tasks as unknown[]).slice(0, 8).map((t, i) => (
                  <li key={i}>
                    •{" "}
                    {typeof t === "object" && t && "title" in t
                      ? String((t as { title: unknown }).title)
                      : String(t)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link href="/customer/dashboard" className={btnPrimary}>
            Dashboard&apos;a git
          </Link>
        </div>
      </DemoShell>
    );
  }

  return (
    <DemoShell
      title="Etkinlik Sihirbazı"
      subtitle={`Adım ${step + 1} / ${STEPS.length}: ${STEPS[step].label}`}
    >
      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? "bg-violet-400" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className={`${glassCard} max-w-lg`}>
        {step === 0 ? (
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Etkinlik tipi</span>
            <select
              className={selectClass}
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {step === 1 ? (
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Tarih</span>
            <input
              type="date"
              className={inputClass}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </label>
        ) : null}
        {step === 2 ? (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 text-xs text-zinc-500">Şehir</span>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 text-xs text-zinc-500">İlçe</span>
              <input
                className={inputClass}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </label>
          </div>
        ) : null}
        {step === 3 ? (
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Kişi sayısı</span>
            <input
              type="number"
              className={inputClass}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
            />
          </label>
        ) : null}
        {step === 4 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 text-xs text-zinc-500">Min bütçe</span>
              <input
                type="number"
                className={inputClass}
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 text-xs text-zinc-500">Max bütçe</span>
              <input
                type="number"
                className={inputClass}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
              />
            </label>
          </div>
        ) : null}
        {step === 5 ? (
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Stil</span>
            <select
              className={selectClass}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {step === 6 ? (
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">
              Kategoriler (virgülle ayırın)
            </span>
            <input
              className={inputClass}
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="Mekan, Catering, Fotoğrafçı"
            />
          </label>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}

        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setStep((s) => s - 1)}
            >
              Geri
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className={btnPrimary}
              onClick={() => setStep((s) => s + 1)}
            >
              İleri
            </button>
          ) : (
            <button
              type="button"
              className={btnPrimary}
              disabled={loading}
              onClick={() => void finish()}
            >
              {loading ? "Oluşturuluyor…" : "Planı oluştur"}
            </button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}

export function EventWizardView() {
  return (
    <ProtectedRoute allowedRoles={["Customer"]}>
      <WizardContent />
    </ProtectedRoute>
  );
}
