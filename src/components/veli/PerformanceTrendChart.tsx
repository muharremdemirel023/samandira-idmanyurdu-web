// Performans eğrisi (0-10): sunucuda çizilen alan grafiği. Çizgi ve dolgu
// genişliğe esneyen SVG'dir; noktalar ve eksen etiketleri HTML olarak yüzde
// konumlarla yerleşir, böylece dar ekranlarda da daire/yazı bozulmaz.

export type TrendPoint = { label: string; score: number };

const MAX_SCORE = 10;

export function PerformanceTrendChart({ points }: { points: TrendPoint[] }) {
  const coords = points.map((point, index) => ({
    ...point,
    x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
    y: 100 - (Math.max(0, Math.min(MAX_SCORE, point.score)) / MAX_SCORE) * 100,
  }));

  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,100 ${coords.length === 1 ? `0,${coords[0].y} ` : ""}${line}${
    coords.length === 1 ? ` 100,${coords[0].y}` : ""
  } 100,100`;

  return (
    <div className="flex h-full gap-2">
      <div className="flex w-6 shrink-0 flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-white/45">
        <span>10</span>
        <span>5</span>
        <span>0</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible"
          >
            <defs>
              <linearGradient id="veliTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#CB1B24" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#CB1B24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={area} fill="url(#veliTrend)" />
            {coords.length > 1 ? (
              <polyline
                points={line}
                fill="none"
                stroke="#E23A42"
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {coords.map((point, index) => (
            <span
              key={`${point.label}-${index}`}
              title={`${point.label}: ${point.score.toFixed(1)}`}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E23A42] ring-2 ring-white/70"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>

        <div className="relative mt-2 h-4 text-[11px] text-white/60">
          {coords.map((point, index) => {
            // Kalabalıkta yalnızca ilk, son ve aradaki bazı etiketler gösterilir.
            const step = Math.ceil(coords.length / 5);
            const visible =
              index === 0 || index === coords.length - 1 || index % step === 0;
            if (!visible) return null;
            const align =
              index === 0 && coords.length > 1
                ? "translate-x-0"
                : index === coords.length - 1 && coords.length > 1
                  ? "-translate-x-full"
                  : "-translate-x-1/2";
            return (
              <span
                key={`${point.label}-${index}`}
                className={`absolute whitespace-nowrap ${align}`}
                style={{ left: `${point.x}%` }}
              >
                {point.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
