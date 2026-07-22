import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-calm-100 bg-warmth-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Logo placeholder — swap for the foundation's real logo */}
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-calm-300 to-calm-500 text-lg text-white shadow-soft">
            💙
          </span>
          <span className="text-lg font-semibold tracking-tight text-calm-700">
            ICF Mini-Apps Hub
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-calm-600">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/70 hover:text-calm-700"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/70 hover:text-calm-700"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
