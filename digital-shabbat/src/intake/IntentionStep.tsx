import { Atmosphere } from '../shared/Atmosphere';
import './intake-draft.css';

/* Step 2 — "What are you making room for?" Written freely. Becomes the
   pledge's `intention`. */

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function IntentionStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const canContinue = value.trim().length > 0;

  return (
    <main className="screen screen--day draft write" aria-labelledby="write-title">
      <Atmosphere variant="dusk" />

      <div className="write__progress" aria-hidden="true">
        <div className="write__dots">
          <i className="on" /><hr /><i className="on" /><hr /><i className="on" />
        </div>
        <span className="write__count">3 of 3</span>
      </div>

      <h1 className="draft__title" id="write-title">
        What are you making <em>room</em> for?
      </h1>
      <p className="write__label">Write freely…</p>

      <textarea
        className="write__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="reading on the porch · my kids · nothing at all, gloriously"
        aria-label="What are you making room for?"
      />

      <footer className="draft__foot">
        <button className="draft__back" type="button" onClick={onBack}>Back</button>
        <button className="stone" type="button" aria-label="Make my pledge" disabled={!canContinue} onClick={onNext}>
          <CheckIcon />
        </button>
      </footer>
    </main>
  );
}
