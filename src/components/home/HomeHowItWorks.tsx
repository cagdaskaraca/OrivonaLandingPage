import { HelpStepIcon } from "@/src/components/help/HelpStepIcon";
import { HOW_IT_WORKS_STEPS } from "@/src/lib/helpContent";
import { glassCard } from "@/src/lib/ui";

export function HomeHowItWorks() {
  return (
    <section
      id="nasil-calisir"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Nasıl çalışır
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Etkinliğinizi baştan sona yönetin
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Planlamadan QR davetiyeye kadar altı adımda ORIVONA akışı.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl">
          {/* Vertical timeline line — mobile + desktop */}
          <div
            className="pointer-events-none absolute bottom-4 left-[1.65rem] top-4 w-px bg-gradient-to-b from-violet-500/50 via-fuchsia-500/30 to-violet-500/10 sm:left-1/2 sm:-ml-px md:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[6%] right-[6%] top-8 z-0 hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent md:block"
            aria-hidden
          />

          <ol className="relative z-10 flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-8 lg:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <li
                key={step.id}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <div className="relative z-10 flex shrink-0 flex-col items-center md:mb-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/35 bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 shadow-[0_0_28px_-6px_rgba(167,139,250,0.45)]">
                    <HelpStepIcon name={step.icon} className="h-6 w-6" />
                  </span>
                  <span className="mt-1.5 text-[10px] font-bold text-violet-300/80">
                    {i + 1}
                  </span>
                </div>
                <div
                  className={`${glassCard} min-w-0 flex-1 py-5 md:w-full md:flex-none`}
                >
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {step.description}
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
