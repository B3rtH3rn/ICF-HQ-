import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-calm-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo placeholder — swap for the foundation's real logo */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-calm-500 text-lg text-white">
            💙
          </span>
          <span className="text-lg font-semibold text-calm-700">
            ICF Mini-Apps Hub
          </span>
        </Link>
        <nav className="flex gap-5 text-sm font-medium text-calm-600">
          <Link href="/" className="hover:text-calm-500">
            Home
          </Link>
          <Link href="/about" className="hover:text-calm-500">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
