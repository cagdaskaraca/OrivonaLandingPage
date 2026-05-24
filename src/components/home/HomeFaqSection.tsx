import { FaqAccordion } from "@/src/components/help/FaqAccordion";
import { FAQ_ITEMS } from "@/src/lib/helpContent";

export function HomeFaqSection() {
  return (
    <section
      id="sss"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Sık sorulan sorular
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Merak ettikleriniz
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Rezervasyon, teklifler, AI planlayıcı ve işletme süreçleri hakkında
            kısa yanıtlar.
          </p>
        </div>
        <div className="mt-10">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
