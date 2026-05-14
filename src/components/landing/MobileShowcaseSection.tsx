import Image from "next/image";

export function MobileShowcaseSection() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(90vw,28rem)] w-[min(95vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="orivona-phone-float relative mx-auto max-w-md">
        <div className="rounded-[2.25rem] border border-zinc-500/80 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black p-[7px] shadow-[0_32px_80px_-20px_rgba(109,40,217,0.55)] ring-2 ring-violet-400/25">
          <div className="overflow-hidden rounded-[1.85rem] bg-black ring-1 ring-white/10">
            <Image
              src="/mobile-app-showcase.png"
              alt="ORIVONA mobil uygulama yakında"
              width={780}
              height={1688}
              loading="lazy"
              sizes="(max-width: 768px) 85vw, 448px"
              className="h-auto w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <span className="inline-flex min-w-[140px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm">
          App Store
        </span>
        <span className="inline-flex min-w-[140px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm">
          Google Play
        </span>
      </div>
      <p className="mt-3 text-center text-[11px] text-zinc-600">
        Mağaza bağlantıları lansman ile yayınlanacaktır.
      </p>
    </div>
  );
}
