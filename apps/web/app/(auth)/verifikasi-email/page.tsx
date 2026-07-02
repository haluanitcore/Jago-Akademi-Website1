import { Suspense } from "react";
import VerifyEmailPanel from "./VerifyEmailPanel";

export default function VerifikasiEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-[#6E6E73] py-8">Memuat…</div>
      }
    >
      <VerifyEmailPanel />
    </Suspense>
  );
}
