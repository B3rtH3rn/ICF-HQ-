/**
 * Abstract, faceless soft-silhouette "you" — a calm glowing figure, never a
 * literal or clinical body. Head + shoulders bust filled with a soft blue→cyan
 * gradient, a breathing scale, a glowing halo, and a slow orbiting ring.
 */
export default function SilhouetteAvatar() {
  return (
    <div className="relative flex items-center justify-center">
      {/* glowing halo */}
      <div className="pointer-events-none absolute h-72 w-72 animate-pulse-glow rounded-full bg-glow/20 blur-3xl" />

      {/* orbiting arc */}
      <div
        className="pointer-events-none absolute h-64 w-64 animate-spin-slow rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0 66%, rgb(var(--accent) / 0.5) 86%, transparent 96%)",
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent 88%, #000 89%, #000 91%, transparent 92%)",
          maskImage:
            "radial-gradient(closest-side, transparent 88%, #000 89%, #000 91%, transparent 92%)",
        }}
      />
      <div className="pointer-events-none absolute h-64 w-64 rounded-full border border-accent/15" />
      <div className="pointer-events-none absolute h-52 w-52 rounded-full border border-accent2/10" />

      {/* silhouette */}
      <div className="relative animate-breathe">
        <svg
          width="150"
          height="165"
          viewBox="0 0 200 220"
          aria-hidden="true"
          style={{ filter: "drop-shadow(0 0 24px rgb(var(--accent) / 0.45))" }}
        >
          <defs>
            <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--glow))" stopOpacity="0.95" />
              <stop
                offset="100%"
                stopColor="rgb(var(--accent-2))"
                stopOpacity="0.85"
              />
            </linearGradient>
          </defs>
          <circle cx="100" cy="66" r="40" fill="url(#silhouette)" />
          <path
            d="M38 214 C38 150 62 126 100 126 C138 126 162 150 162 214 Z"
            fill="url(#silhouette)"
          />
        </svg>
      </div>
    </div>
  );
}
