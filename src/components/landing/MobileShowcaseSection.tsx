import Image from "next/image";

export function MobileShowcaseSection() {
  return (
    <div className="relative mx-auto w-full max-w-full px-4 lg:max-w-7xl">
      <div
        className="pointer-events-none absolute left-1/2 top-[40%] h-[min(95vw,40rem)] w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/30 blur-3xl lg:h-[42rem] lg:w-[90%]"
        aria-hidden
      />
      <div className="orivona-phone-float relative mx-auto w-full max-w-6xl">
        <div className="mx-auto w-full max-w-6xl rounded-[32px] border border-zinc-500/80 bg-gradient-to-b from-zinc-700 via-zinc-900 to-black p-2 shadow-2xl ring-2 ring-violet-400/30 sm:p-3 lg:rounded-[2rem]">
          <div className="overflow-hidden rounded-[1.75rem] bg-black ring-1 ring-white/10 sm:rounded-[1.85rem] lg:rounded-[1.9rem]">
            <Image
              src="/mobile-app-showcase.png"
              alt="ORIVONA mobil uygulama yakında"
              width={780}
              height={1688}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, min(80vw, 72rem)"
              className="mx-auto h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
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
