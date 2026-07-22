import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-calm-100 bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-calm-500">
          © Inspiring Children Foundation
        </p>
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
