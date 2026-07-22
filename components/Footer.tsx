import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-calm-100 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-calm-300 to-calm-500 text-white">
            💙
          </span>
          <p className="text-sm text-calm-600">
            Built with care by the youth developers of our foundation.
          </p>
        </div>
        <p className="text-sm text-calm-600">
          Have an app to add?{" "}
          <Link
            href="/about"
            className="font-medium text-calm-500 underline-offset-2 hover:underline"
          >
            See how it works →
          </Link>
        </p>
      </div>
    </footer>
  );
}
