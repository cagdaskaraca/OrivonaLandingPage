import { HelpStepIcon } from "@/src/components/help/HelpStepIcon";
import { TRUST_PILLARS } from "@/src/lib/helpContent";
import { glassCard } from "@/src/lib/ui";

export function HomeTrustSection() {
  return (
    <section
      id="guven"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Güven ve profesyonellik
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Neden ORIVONA?
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Doğrulanmış işletmeler, güvenli rezervasyon ve modern davetiye
            deneyimi tek platformda.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((item) => (
            <div
              key={item.title}
              className={`${glassCard} flex flex-col transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10">
                <HelpStepIcon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
