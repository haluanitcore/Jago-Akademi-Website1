import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jago Akademi — Platform Edukasi Digital Indonesia",
    template: "%s | Jago Akademi",
  },
  description:
    "Platform edukasi digital terlengkap: E-Course, Event, Trainer Program, LMS, E-Book, dan Marketplace Materi. Belajar, berlatih, dan berkarier bersama Jago Akademi.",
  keywords: [
    "edukasi digital", "kursus online", "trainer profesional",
    "LMS Indonesia", "sertifikasi", "belajar online",
  ],
  authors: [{ name: "Jago Akademi" }],
  creator: "Jago Akademi",
  metadataBase: new URL("https://jagoakademi.com"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://jagoakademi.com",
    siteName: "Jago Akademi",
    title: "Jago Akademi — Platform Edukasi Digital Indonesia",
    description:
      "Platform pertama di Indonesia yang menyatukan ekosistem belajar, berlatih, dan berkarier dalam satu pintu digital.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jago Akademi — Platform Edukasi Digital Indonesia",
    description: "Belajar, berlatih, dan berkarier bersama Jago Akademi.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#00d4ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
