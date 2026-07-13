"use client";

import { useState } from "react";

type Faq = { q: string; a: string };

const SYMBOL_COLORS = [
  "text-indigo-text",
  "text-coral-text",
  "text-green-text",
  "text-teal-text",
  "text-pink-text",
];

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="flex flex-col gap-3 mb-12">
      {items.map((item, i) => {
        const isOpen = !!open[i];
        return (
          <div
            key={item.q}
            className="border border-line rounded-2xl px-[22px] py-5 cursor-pointer focus-ring"
            onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((s) => ({ ...s, [i]: !s[i] }));
              }
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[16px] font-semibold text-text">{item.q}</div>
              <div
                className={`font-display text-xl shrink-0 ${SYMBOL_COLORS[i % SYMBOL_COLORS.length]}`}
                aria-hidden="true"
              >
                {isOpen ? "−" : "+"}
              </div>
            </div>
            {isOpen && (
              <p className="text-[15px] leading-[1.6] text-text-muted mt-3.5 mb-0">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
