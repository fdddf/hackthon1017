import type { Day, Place } from './types';

const T0 = 1005; // 16:45
const T1 = 1380; // 23:00

export function mins(hhmm: string | null | undefined): number | null {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

export function isLate(at: string | undefined, target: string): boolean {
  const a = mins(at);
  const t = mins(target);
  return a !== null && t !== null && a - t > 20;
}

/**
 * Five evenings, one line each, from getting home to getting into bed.
 *
 * Every mark is the same colour on purpose. The product's claim is that it does
 * not grade a child; a chart that scored his week in traffic lights would give
 * that away in the first second a judge looked at it. Position carries the
 * message and colour stays out of it.
 */
export function WeekChart({ week, compact = false }: { week: Day[]; compact?: boolean }) {
  const w = compact ? 300 : 620;
  const padL = compact ? 30 : 56;
  const padR = compact ? 12 : 22;
  const top = compact ? 20 : 42;
  const rowH = compact ? 22 : 34;
  const h = top + week.length * rowH + (compact ? 16 : 22);
  const plot = w - padL - padR;
  const x = (m: number) => padL + ((m - T0) / (T1 - T0)) * plot;

  const ticks = [1020, 1140, 1260, 1380];
  const tickLabels = ['17:00', '19:00', '21:00', '23:00'];
  const bottom = top + (week.length - 1) * rowH;

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Five evenings from getting home to bedtime. Tuesday and Thursday start and end about ninety minutes later than the other three days."
    >
      {/* a faint band behind the two days that differ — grouping, not a verdict */}
      {week.map((d, i) =>
        d.day === 'Tue' || d.day === 'Thu' ? (
          <rect
            key={`b${d.day}`}
            className="ev-band"
            x={padL - 6}
            y={top + i * rowH - rowH / 2 + 3}
            width={plot + 12}
            height={rowH - 6}
            rx={5}
          />
        ) : null,
      )}

      {ticks.map((t, i) => (
        <g key={t}>
          <line className="ev-grid" x1={x(t)} y1={top - 10} x2={x(t)} y2={bottom + 12} />
          <text className="ev-tick" x={x(t)} y={bottom + 26} textAnchor="middle">
            {tickLabels[i]}
          </text>
        </g>
      ))}

      {week.map((d, i) => {
        const y = top + i * rowH;
        // A missing time skips its mark rather than taking the page down mid-demo.
        const marks = [
          { m: mins(d.home), t: d.home, n: 'got home' },
          { m: mins(d.homework), t: d.homework, n: 'homework started' },
          { m: mins(d.sleep), t: d.sleep, n: 'in bed' },
        ]
          .filter((k): k is { m: number; t: string; n: string } => k.m !== null)
          .map((k) => ({ ...k, cx: x(k.m) }));
        if (!marks.length) return null;
        return (
          <g key={d.day}>
            <text className="ev-day" x={padL - 10} y={y + 4} textAnchor="end">
              {d.day}
            </text>
            <line className="ev-line" x1={marks[0].cx} y1={y} x2={marks[marks.length - 1].cx} y2={y} />
            {marks.map((m) => (
              <circle key={m.n} className="ev-dot" cx={m.cx} cy={y} r={compact ? 4 : 5}>
                <title>{`${d.day} · ${m.n} ${m.t}`}</title>
              </circle>
            ))}
            {/* direct labels on the first row only — never a number on every point */}
            {i === 0 && !compact
              ? marks.map((m) => (
                  <text key={`l${m.n}`} className="ev-lab" x={m.cx} y={y - 13} textAnchor="middle">
                    {m.n}
                  </text>
                ))
              : null}
          </g>
        );
      })}
    </svg>
  );
}

export function WeekTable({ week }: { week: Day[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Got home</th>
          <th>Homework</th>
          <th>In bed</th>
          <th>Moved</th>
          <th>Mood</th>
        </tr>
      </thead>
      <tbody>
        {week.map((d) => (
          <tr key={d.day}>
            <td>{d.day}</td>
            <td>{d.home}</td>
            <td>{d.homework}</td>
            <td>{d.sleep}</td>
            <td>{d.move ?? '—'}</td>
            <td>{d.mood}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ROADS_V = [90, 205, 320, 435, 545];
const ROADS_H = [62, 134, 206, 262];
const BLOCKS: [number, number, number, number][] = [
  [40, 34, 36, 16], [112, 80, 70, 40], [232, 34, 60, 16], [350, 90, 60, 34],
  [460, 150, 70, 40], [120, 160, 60, 32], [250, 215, 54, 32], [440, 36, 56, 14],
  [352, 220, 62, 30], [40, 220, 36, 30],
];

/**
 * Pins where a check-in happened. Not a trail, and deliberately not a live
 * location — the child attached every one of these himself by tapping.
 */
export function PlaceMap({ places, week }: { places: Place[]; week: Day[] }) {
  const counts: Record<string, number> = {};
  for (const d of week) if (d.movedAt) counts[d.movedAt] = (counts[d.movedAt] ?? 0) + 1;

  const subFor = (p: Place) => {
    if (p.id === 'home') return `got home · ${week.length} pins`;
    if (p.id === 'school') return `left · ${week.length} pins`;
    if (p.id === 'park') return `moved · Mon Wed Fri`;
    return `moved · Tue Thu`;
  };
  const dyFor = (p: Place) => (p.id === 'home' ? 24 : p.id === 'park' ? 26 : p.id === 'school' ? -24 : -26);

  return (
    <svg
      className="map-svg"
      viewBox="0 0 620 310"
      role="img"
      aria-label="A schematic neighbourhood. Home, school and the park sit close together; the sports hall used on Tuesdays and Thursdays is across town."
    >
      {ROADS_V.map((vx) => (
        <line key={`v${vx}`} className="mp-road" x1={vx} y1={20} x2={vx} y2={290} />
      ))}
      {ROADS_H.map((hy) => (
        <line key={`h${hy}`} className="mp-road" x1={24} y1={hy} x2={600} y2={hy} />
      ))}
      {BLOCKS.map((b, i) => (
        <rect key={i} className="mp-block" x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx={3} />
      ))}

      {/* the long hop, drawn once so the distance is legible */}
      <path
        d="M 205 206 C 300 150, 420 110, 545 62"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeDasharray="4 5"
        opacity={0.4}
      />
      <text className="mp-sub" x={372} y={128} textAnchor="middle">
        35 min each way
      </text>

      {places.map((p) => {
        const dy = dyFor(p);
        return (
          <g key={p.id}>
            <circle className={p.far ? 'mp-pin-far' : 'mp-pin-near'} cx={p.x} cy={p.y} r={8} />
            <text className="mp-lab" x={p.x} y={p.y + dy} textAnchor="middle">
              {p.label}
            </text>
            <text className="mp-sub" x={p.x} y={p.y + dy + 12} textAnchor="middle">
              {subFor(p)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
