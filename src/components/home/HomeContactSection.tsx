import { glassCard } from "@/src/lib/ui";

const MAIL_INFO = "mailto:info@orivona.com";
const MAIL_PARTNERS = "mailto:partners@orivona.com";

export function HomeContactSection() {
  return (
    <section
      id="iletisim"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            İletişim
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Sorularınız ve iş birliği talepleriniz için bize ulaşın.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          <a
            href={MAIL_INFO}
            className={`${glassCard} group block transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              Genel iletişim
            </p>
            <p className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
              info@orivona.com
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Ürün, destek ve genel sorularınız için.
            </p>
          </a>
          <a
            href={MAIL_PARTNERS}
            className={`${glassCard} group block transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/90">
              İş ortaklığı
            </p>
            <p className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-violet-100">
              partners@orivona.com
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              İşletme ve partner başvuruları için.
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
