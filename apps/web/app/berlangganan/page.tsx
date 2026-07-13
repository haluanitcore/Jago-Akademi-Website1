"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect /berlangganan → /dashboard/berlangganan */
export default function BerlanggananRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/berlangganan"); }, [router]);
  return null;
}
