import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-[#6E6E73] py-8">Memuat…</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
