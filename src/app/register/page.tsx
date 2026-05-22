import { Suspense } from "react";
import { RegisterView } from "@/src/components/app/RegisterView";

export const metadata = {
  title: "Kayıt | ORIVONA",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <p className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
          Yükleniyor…
        </p>
      }
    >
      <RegisterView />
    </Suspense>
  );
}
