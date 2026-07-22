/**
 * Abstract, faceless full-body outline representing "you" — a generic line-art
 * figure (head + body + arms + legs), drawn as a glowing stroke rather than a
 * filled shape. Calm and non-clinical: a soft glowing halo, a gentle breathing
 * scale, and a blue→cyan gradient outline.
 */
export default function SilhouetteAvatar() {
  return (
    <div className="relative flex items-center justify-center">
      {/* glowing halo */}
      <div className="pointer-events-none absolute h-72 w-72 animate-pulse-glow rounded-full bg-glow/20 blur-3xl" />

      {/* full-body outline */}
      <div className="relative animate-breathe">
        <svg
          width="150"
          height="285"
          viewBox="0 0 200 380"
          aria-hidden="true"
          style={{ filter: "drop-shadow(0 0 18px rgb(var(--accent) / 0.5))" }}
        >
          <defs>
            <linearGradient id="silhouette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--glow))" />
              <stop offset="100%" stopColor="rgb(var(--accent-2))" />
            </linearGradient>
          </defs>
          <g
            fill="none"
            stroke="url(#silhouette)"
            strokeWidth={11}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <circle cx="100" cy="44" r="32" />
            <path d="M86 100 L50 122 L36 236 L38 256 L52 252 L50 158 L70 168 L66 236 L70 358 L72 368 L90 368 L92 252 L100 242 L108 252 L110 368 L128 368 L130 358 L134 236 L130 168 L150 158 L148 252 L162 256 L164 236 L150 122 L114 100 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
