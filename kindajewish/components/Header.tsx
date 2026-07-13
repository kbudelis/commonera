"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/learn", label: "Learn" },
  { href: "/holidays", label: "Holidays" },
  { href: "/culture", label: "Culture" },
  { href: "/community", label: "Community" },
  { href: "/life-moments", label: "Life Moments" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1160px] px-5 md:px-6 flex items-center justify-between h-[72px] gap-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-text focus-ring rounded"
          onClick={() => setOpen(false)}
        >
          kinda jewish
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors focus-ring ${
                  active ? "bg-surface text-text" : "text-text-muted hover:bg-surface hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/ask"
            className="inline-flex items-center bg-indigo hover:bg-indigo-hover text-ink font-display font-bold text-sm px-[18px] py-2.5 rounded-full transition-colors focus-ring whitespace-nowrap"
          >
            Ask a question
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden focus-ring rounded p-2 -mr-2"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="lg:hidden border-t border-line bg-bg px-5 py-4 flex flex-col gap-1"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2.5 text-base text-text focus-ring rounded"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/ask"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center bg-indigo text-ink font-display font-bold text-sm px-[18px] py-2.5 rounded-full focus-ring w-fit"
          >
            Ask a question
          </Link>
        </nav>
      )}
    </header>
  );
}
