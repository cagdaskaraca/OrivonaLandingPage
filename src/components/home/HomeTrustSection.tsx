import { glassCard } from "@/src/lib/ui";

const trustItems = [
  {
    title: "Doğrulanmış işletmeler",
    body: "Profil ve belge kontrolleriyle güvenilir hizmet sağlayıcıları.",
  },
  {
    title: "Teklif sistemi",
    body: "Birden fazla teklifi karşılaştırın, en uygununu seçin.",
  },
  {
    title: "QR davetiye sistemi",
    body: "Misafirlerinize dijital davetiye ve QR bilet paylaşın.",
  },
  {
    title: "Misafir yönetimi",
    body: "RSVP, kontakt ve katılım durumunu tek panelden takip edin.",
  },
  {
    title: "Organizasyon takvimi",
    body: "Etkinlik tarihleri, görevler ve hizmetleri tek takvimde yönetin.",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section
      id="guven"
      className="relative scroll-mt-28 border-t border-violet-200/[0.06] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            Güven ve kontrol
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Organizasyonunuz için eksiksiz araç seti
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Keşiften teklife, davetiyeden takvime — gerçek bir etkinlik platformu.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className={`${glassCard} transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet-300/25`}
            >
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
