import { Suspense } from "react";
import { LoginView } from "@/src/components/app/LoginView";

export const metadata = {
  title: "Giriş | ORIVONA",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-zinc-400">
          Yükleniyor…
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
