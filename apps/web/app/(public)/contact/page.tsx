import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Hubungi Kami | Jago Akademi",
  description:
    "Ada pertanyaan atau ingin berkolaborasi? Hubungi tim Jago Akademi melalui form, email, atau WhatsApp.",
};

const CONTACTS = [
  {
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    value: "halo@jagoakademi.com",
    href: "mailto:halo@jagoakademi.com",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
  },
  {
    icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Alamat",
    value: "Jakarta Selatan, DKI Jakarta",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <main id="main-content">
      <section className="bg-[#F5F5F7] pt-20 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#CC0052]">Kontak</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1D1D1F]">Hubungi Kami</h1>
          <p className="text-[#6E6E73]">
            Tim kami siap membantu Anda dari Senin–Jumat pukul 09.00–17.00 WIB.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#1D1D1F] mb-6">Informasi Kontak</h2>
              <ul className="space-y-5">
                {CONTACTS.map((c) => (
                  <li key={c.label} className="flex items-start gap-3">
                    <span className="mt-0.5 p-2 bg-[#F5F5F7] rounded-lg text-[#0077A8]">{c.icon}</span>
                    <div>
                      <p className="text-xs text-[#6E6E73] font-medium uppercase tracking-wider">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-[#1D1D1F] hover:text-[#0077A8] font-medium transition-colors">
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-[#1D1D1F] font-medium">{c.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F5F5F7] rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-[#1D1D1F]">Butuh solusi korporat?</h3>
              <p className="text-sm text-[#6E6E73]">
                Tim sales kami siap membantu Anda merancang program pelatihan yang tepat untuk organisasi Anda.
              </p>
              <a href="/clients" className="text-sm text-[#0077A8] font-medium hover:underline">
                Lihat paket korporat →
              </a>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
