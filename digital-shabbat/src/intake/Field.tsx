import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getPledge } from '../shared/store';
import { Atmosphere } from '../shared/Atmosphere';
import './intake-draft.css';

/*
  "This is your field" — the user's own words condense into a pearlescent
  ritual object wrapped in a micrography spiral (the accretion object, tokens
  contract A3). Reached from the pledge checkpoint on the way into the candle.

  The orb is a CSS placeholder for a produced pearlescent asset
  (design/system/ASSET-NEEDS.md).
  [COPY NEEDED]: "This is your field…" is reference placeholder copy, not yet
  in contracts/copy.md.
*/

function spiralPath(cx: number, cy: number, turns: number, startR: number, endR: number, steps: number): string {
  const total = turns * 2 * Math.PI;
  const points: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * total;
    const r = startR + (endR - startR) * t;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Field() {
  const pledge = useMemo(getPledge, []);
  const path = useMemo(() => spiralPath(160, 160, 5.5, 20, 150, 720), []);

  const words = useMemo(() => {
    if (!pledge) return '';
    const parts = [pledge.intention, ...(pledge.pledge.items ?? [])].map((p) => p.trim()).filter(Boolean);
    const source = parts.length ? parts.join(' · ') : 'one day, set apart';
    return `${source} · `.repeat(Math.max(4, Math.ceil(64 / source.length)));
  }, [pledge]);

  if (!pledge) return <Navigate to="/design" replace />;

  return (
    <main className="screen screen--day draft field" aria-labelledby="field-title">
      <Atmosphere variant="dusk" />

      <header className="draft__head">
        <h1 className="draft__title" id="field-title" style={{ fontSize: 'clamp(1.5rem, 5.4cqi, 1.9rem)' }}>
          This is your field.<br />It will hold space while you are away.
        </h1>
      </header>

      <div className="field-stage">
        <svg className="field-spiral field-spiral--spin" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <path id="field-spiral-path" d={path} fill="none" />
          </defs>
          <text>
            <textPath href="#field-spiral-path" startOffset="0">{words}</textPath>
          </text>
        </svg>
        <div className="orb" aria-hidden="true" />
      </div>

      <footer className="draft__foot">
        <Link className="stone" to="/candle" aria-label="Continue">
          <ArrowIcon />
        </Link>
      </footer>
    </main>
  );
}
