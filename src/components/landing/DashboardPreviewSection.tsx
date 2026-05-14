import Image from "next/image";

const widgets = [
  {
    title: "Görev listesi",
    stat: "12 açık",
    barClass: "bg-gradient-to-r from-violet-500/40 to-transparent",
  },
  {
    title: "Teklif kutusu",
    stat: "5 yeni",
    barClass: "bg-gradient-to-r from-fuchsia-500/40 to-transparent",
  },
  {
    title: "Organizasyon takvimi",
    stat: "Mart 2026",
    barClass: "bg-gradient-to-r from-indigo-500/40 to-transparent",
  },
  {
    title: "Ödeme takibi",
    stat: "2 bekleyen",
    barClass: "bg-gradient-to-r from-emerald-500/35 to-transparent",
  },
  {
    title: "Etkinlik timeline",
    stat: "Nişan · 4 aşama",
    barClass: "bg-gradient-to-r from-amber-500/35 to-transparent",
  },
  {
    title: "Partner işletmeler",
    stat: "8 aktif",
    barClass: "bg-gradient-to-r from-violet-500/40 to-transparent",
  },
] as const;

export function DashboardPreviewSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-5 lg:items-start lg:gap-12">
      <div className="relative lg:col-span-3">
        <div className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-violet-600/20 via-transparent to-fuchsia-500/15 blur-2xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-black/40 p-2 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-3">
          <Image
            src="/ai-dashboard-preview.png"
            alt="ORIVONA organizasyon yönetim paneli yakında"
            width={1600}
            height={1000}
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="h-auto w-full rounded-2xl object-cover"
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center sm:inset-x-4 sm:bottom-4">
            <span className="rounded-full border border-violet-300/30 bg-black/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200 backdrop-blur-md sm:text-xs">
              Yakında · Genel erişim
            </span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
        {widgets.map((w) => (
          <div
            key={w.title}
            className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent px-4 py-3 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-[0_12px_40px_-16px_rgba(139,92,246,0.25)]"
          >
            <div className={`mb-2 h-1 w-8 rounded-full ${w.barClass}`} />
            <p className="text-sm font-semibold text-white">{w.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{w.stat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
