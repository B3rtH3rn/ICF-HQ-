import {
  AvatarConfig,
  EnergyStyle,
  HairStyle,
  POSE_PATHS,
  SYMBOL_OPTIONS,
} from "@/lib/avatarOptions";

/* Ambient energy layer around the figure — subtle, performant CSS motion. */
function EnergyLayer({ energy, color }: { energy: EnergyStyle; color: string }) {
  if (energy === "still") return null;

  const box =
    "pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2";

  if (energy === "sparkles") {
    const pts = [
      [14, 22],
      [82, 12],
      [90, 58],
      [18, 68],
      [50, 88],
      [72, 34],
      [34, 46],
      [86, 82],
    ];
    return (
      <div className={box}>
        {pts.map((p, i) => (
          <span
            key={i}
            className="absolute animate-pulse-glow rounded-full"
            style={{
              left: `${p[0]}%`,
              top: `${p[1]}%`,
              width: i % 2 ? 6 : 4,
              height: i % 2 ? 6 : 4,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (energy === "trails") {
    const trails = [
      [16, 26, 22, 130],
      [78, 18, 16, 108],
      [58, 66, 14, 96],
      [30, 60, 12, 80],
    ];
    return (
      <div className={box}>
        {trails.map((t, i) => (
          <span
            key={i}
            className="absolute animate-float rounded-full blur-md"
            style={{
              left: `${t[0]}%`,
              top: `${t[1]}%`,
              width: t[2],
              height: t[3],
              background: `linear-gradient(${color}, transparent)`,
              opacity: 0.35,
              animationDelay: `${i * 1.3}s`,
              animationDuration: "9s",
            }}
          />
        ))}
      </div>
    );
  }

  // shards
  const shards = [
    [16, 24, 18],
    [80, 30, 14],
    [72, 70, 16],
    [22, 66, 12],
    [52, 14, 10],
  ];
  return (
    <div className={box}>
      {shards.map((s, i) => (
        <span
          key={i}
          className="absolute animate-float-slow"
          style={{
            left: `${s[0]}%`,
            top: `${s[1]}%`,
            width: s[2],
            height: s[2],
            backgroundColor: color,
            opacity: 0.22,
            transform: "rotate(45deg)",
            borderRadius: 3,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Orbiting accent symbols — slow ring, symbols kept upright via counter-spin. */
function SymbolOrbit({ symbols }: { symbols: string[] }) {
  const chars = symbols
    .map((id) => SYMBOL_OPTIONS.find((s) => s.id === id)?.char)
    .filter(Boolean) as string[];
  if (chars.length === 0) return null;
  const r = 158;

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 animate-spin-slow">
      {chars.map((c, i) => {
        const angle = (i / chars.length) * 360;
        return (
          <div
            key={i}
            className="absolute"
            style={{ transform: `rotate(${angle}deg) translateY(-${r}px)` }}
          >
            <div style={{ transform: `rotate(${-angle}deg)` }}>
              <span
                className="block animate-spin-slow-reverse text-2xl"
                style={{ filter: "drop-shadow(0 0 6px rgba(140,200,255,0.5))" }}
              >
                {c}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Stylized hair as soft light shapes (not realistic texture). */
function Hair({ hair, color }: { hair: HairStyle; color: string }) {
  if (hair === "none") return null;
  const cap = (
    <path
      d="M67 48 C64 8 136 8 133 48 C123 30 114 22 100 22 C86 22 77 30 67 48 Z"
      fill={color}
      opacity={0.7}
    />
  );
  if (hair === "short") return <g>{cap}</g>;
  if (hair === "long")
    return (
      <g>
        {cap}
        <path
          d="M70 34 C48 92 50 152 60 202"
          stroke={color}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          opacity={0.55}
        />
        <path
          d="M130 34 C152 92 150 152 140 202"
          stroke={color}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          opacity={0.55}
        />
      </g>
    );
  // tied back
  return (
    <g>
      {cap}
      <path
        d="M128 26 C158 40 160 94 143 128 C152 96 150 48 126 34 Z"
        fill={color}
        opacity={0.55}
      />
    </g>
  );
}

export default function ConfigurableAvatar({
  config,
  size = 150,
}: {
  config: AvatarConfig;
  size?: number;
}) {
  const color = config.color;
  const strokeColor = color ?? "url(#silh-grad)";
  const glowCss = color ? `${color}80` : "rgb(var(--accent) / 0.5)";
  const haloColor = color ?? "rgb(var(--glow))";
  const energyColor = color ?? "rgb(var(--accent))";
  const hairColor = config.hairColor ?? config.color ?? "rgb(var(--glow))";
  const h = Math.round((size * 380) / 200);

  return (
    <div className="relative flex items-center justify-center">
      {/* halo */}
      <div
        className="pointer-events-none absolute h-72 w-72 animate-pulse-glow rounded-full blur-3xl"
        style={{ backgroundColor: haloColor, opacity: 0.2 }}
      />

      <EnergyLayer energy={config.energy} color={energyColor} />
      <SymbolOrbit symbols={config.symbols} />

      {/* figure */}
      <div className="relative animate-breathe">
        <svg
          width={size}
          height={h}
          viewBox="0 0 200 380"
          aria-hidden="true"
          style={{ filter: `drop-shadow(0 0 18px ${glowCss})` }}
        >
          <defs>
            <linearGradient id="silh-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--glow))" />
              <stop offset="100%" stopColor="rgb(var(--accent-2))" />
            </linearGradient>
          </defs>
          <g
            fill="none"
            stroke={strokeColor}
            strokeWidth={11}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <circle cx="100" cy="44" r="32" />
            <path d={POSE_PATHS[config.pose]} />
          </g>
          <Hair hair={config.hair} color={hairColor} />
        </svg>
      </div>
    </div>
  );
}
