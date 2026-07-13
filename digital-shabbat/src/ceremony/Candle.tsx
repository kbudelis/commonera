import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPledge } from '../shared/store';
import NoPledge from './NoPledge';
import { formatCeremonyEnd } from './time';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import './ceremony.css';

/* The copy contract reads "Your phone is going [phoneHome]" and expects a
   prepositional phrase, but the intake placeholder invites bare noun phrases
   ("a drawer, a shelf"). Bridge the seam: prepend "to" unless the user's own
   words already carry a preposition. */
const LEADING_PREPOSITION = /^(to|in|into|on|onto|at|under|behind|beside|inside|near|with|by|across|downstairs|upstairs|away|somewhere|wherever)\b/i;
function withPreposition(phoneHome: string): string {
  return LEADING_PREPOSITION.test(phoneHome) ? phoneHome : `to ${phoneHome}`;
}

/* The whole intention is illuminated — never a mechanically split first word. */
function InitialWordPanel({ text }: { text: string }) {
  return (
    <span className="ceremony-initial-panel">
      <span className="ceremony-initial-word">{text.trim()}</span>
    </span>
  );
}

function Veil() {
  return (
    <main className="screen screen--night ceremony-veil" aria-label="Close your eyes for a moment. When you open them, it will have already begun.">
      <div className="ceremony-carpet" />
      <div className="ceremony-veil-copy">
        <p>Close your eyes for a moment.</p>
        <p>When you open them, it will have already begun.</p>
      </div>
      {/* after the words settle, the whole veil sinks to black before the candle rises */}
      <div className="ceremony-veil-blackout" aria-hidden="true" />
    </main>
  );
}

export default function Candle() {
  const pledge = useMemo(() => getPledge(), []);
  const [showCandle, setShowCandle] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const end = pledge ? formatCeremonyEnd(pledge.timing.end) : '';

  useEffect(() => {
    // hold for the blackout to complete (veil copy → couple-second hold → fade to black)
    const timer = window.setTimeout(() => setShowCandle(true), prefersReducedMotion ? 1300 : 7400);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (!pledge) return <NoPledge />;
  if (!showCandle) return <Veil />;

  return (
    <main className="screen screen--night ceremony-screen ceremony-screen-candle">
      {/* rise out of the veil's black — the candle field fades up into view */}
      <div className="ceremony-candle-riseup" aria-hidden="true" />
      <div className="candle-plate" aria-hidden="true" />
      <div className="candle-bloom" aria-hidden="true" />
      <div className="candle-scrim" aria-hidden="true" />
      <Link className="candle-skip" to="/havdalah" aria-label="Skip ahead to the return (demo)">
        Skip ahead
      </Link>
      <div className="ceremony-scroll ceremony-scroll--candle">
      <section className="ceremony-copy ceremony-candle-copy" aria-label="Candle lighting">
        <p className="ceremony-line">The candles are lit.</p>
        <p className="ceremony-line">
          <span>From now until {end}, you&apos;ve made room for</span>
          <InitialWordPanel text={pledge.intention} />
        </p>
        {pledge.phoneHome?.trim() ? <p className="ceremony-line">Your phone is going {withPreposition(pledge.phoneHome.trim())}.</p> : null}
        {pledge.substitute?.trim() ? <p className="ceremony-line">When your hand reaches for it — and it will — {pledge.substitute}.</p> : null}
        <p className="ceremony-line">There&apos;s nothing left to do here — that&apos;s the point.</p>
      </section>
      </div>
    </main>
  );
}
