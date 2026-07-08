import type { Metadata } from "next";
import { MasukForm } from "./MasukForm";

export const metadata: Metadata = { title: "Masuk" };

export default function MasukPage() {
  return <MasukForm />;
}
