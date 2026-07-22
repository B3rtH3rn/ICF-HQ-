"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-calm-100 bg-warmth-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-3.5 sm:flex-row sm:justify-between sm:px-6">
        <Link
          href="/"
          className="bg-gradient-to-r from-lilac-400 via-sun-500 to-calm-500 bg-clip-text text-base font-extrabold uppercase tracking-tight text-transparent sm:text-lg"
        >
          Inspiring Children Foundation
        </Link>

        {/* Main menu */}
        <nav className="flex items-center gap-1 rounded-full border border-calm-100 bg-white/60 p-1 text-sm font-semibold">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  active
                    ? "bg-calm-500 text-white shadow-soft"
                    : "text-calm-600 hover:bg-white hover:text-calm-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
