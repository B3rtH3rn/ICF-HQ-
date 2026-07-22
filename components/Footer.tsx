export default function Footer() {
  return (
    <footer className="border-t border-calm-100 bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-calm-600 sm:px-6">
        <p>
          Built with care by the youth developers of our foundation. 💙 Have
          an app to add?{" "}
          <a href="/about" className="underline hover:text-calm-500">
            See how it works.
          </a>
        </p>
      </div>
    </footer>
  );
}
