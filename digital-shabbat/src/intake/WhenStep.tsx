import { Link } from 'react-router-dom';
import type { TimingMode } from '../shared/sun';
import { Atmosphere } from '../shared/Atmosphere';
import './intake-draft.css';

/* Step 0 — "When is your Shabbat?" The quick first tap. Traditional and Sunday
   are one tap; Custom reveals a window to set. */

const OPTIONS: { mode: TimingMode; label: string; aside: string }[] = [
  { mode: 'traditional', label: 'Friday sundown to Saturday night', aside: 'Traditional' },
  { mode: 'sunday', label: 'Sunday, sunrise to sunset', aside: 'Sunday' },
  { mode: 'custom', label: 'A window of your own', aside: 'Custom' },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Value = { mode: TimingMode; customStart: string; customEnd: string };

export default function WhenStep({
  value,
  onChange,
  onNext,
}: {
  value: Value;
  onChange: (patch: Partial<Value>) => void;
  onNext: () => void;
}) {
  return (
    <main className="screen screen--day draft" aria-labelledby="when-title">
      <Atmosphere variant="dusk" />

      <header className="draft__head">
        <p className="draft__eyebrow label">One</p>
        <h1 className="draft__title" id="when-title">
          When is <em>your</em> Shabbat?
        </h1>
      </header>

      <div className="when-stage">
        {OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={value.mode === option.mode ? 'when-option when-option--on' : 'when-option'}
            aria-pressed={value.mode === option.mode}
            onClick={() => onChange({ mode: option.mode })}
          >
            <span className="when-option__dot" />
            <span className="when-option__label">
              {option.label} <em>· {option.aside}</em>
            </span>
          </button>
        ))}

        {value.mode === 'custom' ? (
          <div className="when-custom">
            <label>
              Begins
              <input
                type="datetime-local"
                value={value.customStart}
                onChange={(event) => onChange({ customStart: event.target.value })}
              />
            </label>
            <label>
              Ends
              <input
                type="datetime-local"
                value={value.customEnd}
                onChange={(event) => onChange({ customEnd: event.target.value })}
              />
            </label>
          </div>
        ) : null}
      </div>

      <footer className="draft__foot">
        <Link className="draft__back" to="/welcome">Back</Link>
        <button className="stone" type="button" aria-label="Next" onClick={onNext}>
          <ArrowIcon />
        </button>
      </footer>
    </main>
  );
}
