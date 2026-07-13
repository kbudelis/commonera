import { useMemo, useState } from 'react';
import { Atmosphere } from '../shared/Atmosphere';
import './intake-draft.css';

/* Step 1 — "What are you setting down?" A radial wheel. Multi-select; the
   choices become the pledge's `items`. Center + adds your own. */

const THINGS = ['Email', 'Social', 'The news', 'Work', 'Group chats', 'Games', 'Shopping', 'The feed'];
const CENTER = 160;
const RADIUS = 132;

type Node = { label: string; x: number; y: number; ex: number; ey: number };

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SettingDownStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const chosen = new Set(value);
  const [adding, setAdding] = useState(false);
  const [ownDraft, setOwnDraft] = useState('');
  const ownChips = value.filter((v) => !THINGS.includes(v));

  const nodes = useMemo<Node[]>(() => {
    return THINGS.map((label, i) => {
      const angle = (-90 + i * 45) * (Math.PI / 180);
      return {
        label,
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        ex: CENTER + (RADIUS - 26) * Math.cos(angle),
        ey: CENTER + (RADIUS - 26) * Math.sin(angle),
      };
    });
  }, []);

  function toggle(label: string) {
    const next = new Set(chosen);
    next.has(label) ? next.delete(label) : next.add(label);
    onChange([...next]);
  }

  function commitOwn() {
    const v = ownDraft.trim();
    if (v && !chosen.has(v)) onChange([...value, v]);
    setOwnDraft('');
    setAdding(false);
  }

  return (
    <main className="screen screen--day draft" aria-labelledby="wheel-title">
      <Atmosphere variant="dusk" />

      <header className="draft__head">
        <p className="draft__eyebrow label">Two</p>
        <h1 className="draft__title" id="wheel-title">
          What are <em>you</em> setting down?
        </h1>
        <p className="draft__hint">Tap what you're setting down, or add your own.</p>
      </header>

      <div className="wheel-stage">
        <div className="wheel">
          <div className="wheel__aurora" />
          <svg className="wheel__spokes" viewBox="0 0 320 320" aria-hidden="true">
            {nodes.map((n) => (
              <line
                key={n.label}
                className={chosen.has(n.label) ? 'wheel__spoke wheel__spoke--on' : 'wheel__spoke'}
                x1={CENTER}
                y1={CENTER}
                x2={n.ex}
                y2={n.ey}
              />
            ))}
          </svg>

          {nodes.map((n) => (
            <button
              key={n.label}
              type="button"
              className={chosen.has(n.label) ? 'wheel__node wheel__node--on' : 'wheel__node'}
              style={{ left: `${(n.x / 320) * 100}%`, top: `${(n.y / 320) * 100}%` }}
              aria-pressed={chosen.has(n.label)}
              onClick={() => toggle(n.label)}
            >
              {n.label}
            </button>
          ))}

          <button type="button" className="wheel__center" aria-label="Add your own" onClick={() => setAdding((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          {adding ? (
            <input
              className="wheel__own"
              autoFocus
              value={ownDraft}
              placeholder="name your own…"
              onChange={(e) => setOwnDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitOwn()}
              onBlur={commitOwn}
            />
          ) : ownChips.length ? (
            <div className="wheel__added">
              {ownChips.map((o) => (
                <span key={o}>{o}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <footer className="draft__foot">
        <button className="draft__back" type="button" onClick={onBack}>Back</button>
        <button className="stone" type="button" aria-label="Next" onClick={onNext}>
          <ArrowIcon />
        </button>
      </footer>
    </main>
  );
}
