import { glassCard } from "@/src/lib/ui";

const steps = [
  "AI ile planını oluştur",
  "Marketplace'te hizmet keşfet",
  "Teklif al ve işletmelerle mesajlaş",
  "Etkinliği tek panelden yönet",
] as const;

export function HomeHowItWorks() {
  return (
    <section
      id="nasil-calisir"
      className="relative scroll-mt-28 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Nasıl çalışır?
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Dört adımda organizasyonunuzu baştan sona yönetin.
          </p>
        </div>
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div
            className="pointer-events-none absolute left-[6%] right-[6%] top-[22px] z-0 hidden h-px bg-gradient-to-r from-violet-500/35 via-fuchsia-500/25 to-violet-500/35 md:block"
            aria-hidden
          />
          <ol className="relative z-10 grid gap-8 md:grid-cols-4 md:items-stretch md:gap-6">
            {steps.map((label, i) => (
              <li
                key={label}
                className="relative flex gap-4 md:flex md:h-full md:flex-col md:gap-6"
              >
                <div className="flex shrink-0 flex-col items-center md:justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/35 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-sm font-semibold text-violet-100 shadow-[0_0_24px_-4px_rgba(167,139,250,0.5)]">
                    {i + 1}
                  </span>
                </div>
                <div
                  className={`${glassCard} flex min-h-0 flex-1 flex-col justify-center py-7 md:min-h-[6.25rem] md:py-8 md:text-center`}
                >
                  <p className="text-sm font-medium leading-snug text-white md:text-base">
                    {label}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
