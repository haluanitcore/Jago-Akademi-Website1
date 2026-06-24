"use client";

import { useState } from "react";
import type { FAQ_ITEMS } from "./page";

type Props = { items: typeof FAQ_ITEMS };

export default function FaqAccordion({ items }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <>
      {items.map((group) => (
        <div key={group.category}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#0077A8] mb-4">
            {group.category}
          </h2>
          <div className="space-y-2">
            {group.items.map((item, idx) => {
              const key = `${group.category}-${idx}`;
              const open = openKey === key;
              return (
                <div key={key} className="border border-[#E5E5EA] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenKey(open ? null : key)}
                    aria-expanded={open}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F5F5F7] transition-colors"
                  >
                    <span className="font-medium text-[#1D1D1F] text-sm">{item.q}</span>
                    <svg
                      aria-hidden="true"
                      className={`w-4 h-4 text-[#6E6E73] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-sm text-[#3C3C43] leading-relaxed border-t border-[#E5E5EA] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
