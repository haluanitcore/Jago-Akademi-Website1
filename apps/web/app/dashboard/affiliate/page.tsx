"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect /dashboard/affiliate → /dashboard/afiliasi */
export default function AffiliateRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/afiliasi"); }, [router]);
  return null;
}
