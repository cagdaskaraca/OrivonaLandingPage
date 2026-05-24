import Link from "next/link";
import { glassCard, btnPrimary } from "@/src/lib/ui";

const examplePrompts = [
  "İstanbul Beşiktaş'ta klasik düğün planla",
  "Doğum günü için bütçe planı oluştur",
  "200 kişilik nişan organizasyonu",
] as const;

const checklistPreview = [
  { label: "Mekan", done: true },
  { label: "Catering", done: true },
  { label: "Fotoğrafçı", done: true },
  { label: "Müzik", done: false },
  { label: "Pasta", done: false },
  { label: "Dekorasyon", done: false },
] as const;

export function HomeAiPlannerShowcase() {
  return (
    <section
      id="ai-planlayici"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            AI Planlayıcı
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Etkinliğinizi dakikalar içinde planlayın
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Doğal dilde isteğinizi yazın; AI bütçe, checklist ve hizmet önerileri
            üretsin.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className={`${glassCard} space-y-4`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Örnek istekler
            </p>
            {examplePrompts.map((prompt) => (
              <div
                key={prompt}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-200"
              >
                &ldquo;{prompt}&rdquo;
              </div>
            ))}
          </div>

          <div className={`${glassCard} relative overflow-hidden`}>
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Oluşturulan checklist önizlemesi
            </p>
            <ul className="mt-5 space-y-3">
              {checklistPreview.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${
                      item.done
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                        : "border-violet-400/25 bg-violet-500/10 text-violet-200/80"
                    }`}
                    aria-hidden
                  >
                    {item.done ? "✓" : "·"}
                  </span>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  {item.done ? (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-emerald-300/80">
                      Önerildi
                    </span>
                  ) : (
                    <span className="ml-auto text-[10px] text-zinc-500">Bekliyor</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/ai-planner" className={btnPrimary}>
            AI Planlayıcıyı Aç
          </Link>
        </div>
      </div>
    </section>
  );
}
