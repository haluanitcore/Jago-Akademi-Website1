"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect /pesanan → /dashboard/pesanan */
export default function PesananRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/pesanan"); }, [router]);
  return null;
}
