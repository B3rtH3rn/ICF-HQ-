/**
 * "Your journey" — a soft, glowing wave of gentle activity over time.
 * Deliberately has NO axes, gridlines, or numbers: it reads as an ambient
 * rhythm ("here's your journey"), never a chart or a score. The line is a
 * smoothed spline through the series with a luminous gradient + soft glow and
 * a faint area fade beneath.
 */
export default function JourneyWave({ series }: { series: number[] }) {
  const W = 300;
  const H = 84;
  const pad = 8;
  const n = series.length;

  const xs = series.map((_, i) => pad + (i * (W - 2 * pad)) / (n - 1));
  const ys = series.map((v) => H - pad - v * (H - 2 * pad));
  const pts = xs.map((x, i) => [x, ys[i]] as const);

  // Catmull-Rom → cubic bezier for a smooth, calm curve
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  const area = `${d} L ${xs[n - 1]} ${H} L ${xs[0]} ${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height: 92 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="jw-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(var(--accent-2))" />
          <stop offset="50%" stopColor="rgb(var(--accent))" />
          <stop offset="100%" stopColor="rgb(var(--glow))" />
        </linearGradient>
        <linearGradient id="jw-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--accent) / 0.28)" />
          <stop offset="100%" stopColor="rgb(var(--accent) / 0)" />
        </linearGradient>
        <filter id="jw-glow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={area} fill="url(#jw-fill)" />
      <path
        d={d}
        fill="none"
        stroke="url(#jw-line)"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#jw-glow)"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={3.4}
        fill="rgb(var(--glow))"
        filter="url(#jw-glow)"
      />
    </svg>
  );
}
