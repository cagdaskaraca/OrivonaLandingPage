import { Suspense } from "react";
import { MarketplaceView } from "@/src/components/app/MarketplaceView";

export const metadata = {
  title: "Marketplace | ORIVONA",
  description: "ORIVONA hizmet sağlayıcı marketplace demo",
};

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#06040c] text-zinc-400">
          Yükleniyor…
        </div>
      }
    >
      <MarketplaceView />
    </Suspense>
  );
}
