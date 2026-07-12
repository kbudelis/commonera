import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Mosaic from './Mosaic';
import { attestWeek, getHistory, getPledge } from '../shared/store';
import { Atmosphere } from '../shared/Atmosphere';
import NoPledge from './NoPledge';
import { weekOfPledge } from './time';
import type { WeekRecord } from '../shared/store';
import './ceremony.css';

type Attestation = 'kept' | 'not-this-time' | null;

function combineReflection(noticed: string, carrying: string) {
  const parts = [];
  if (noticed.trim()) parts.push(`what did you notice?\n${noticed.trim()}`);
  if (carrying.trim()) parts.push(`what will you carry into the week?\n${carrying.trim()}`);
  return parts.length ? parts.join('\n\n') : undefined;
}

function ThreeStars() {
  return (
    <div className="ceremony-stars" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function Havdalah() {
  const pledge = useMemo(() => getPledge(), []);
  const [noticed, setNoticed] = useState('');
  const [carrying, setCarrying] = useState('');
  const [history, setHistory] = useState<WeekRecord[]>(() => getHistory());
  const [attestation, setAttestation] = useState<Attestation>(null);
  const attestedRef = useRef(false);

  const attest = (kept: boolean) => {
    if (!pledge || attestedRef.current) return;
    attestedRef.current = true;

    attestWeek({
      weekOf: weekOfPledge(pledge),
      kept,
      reflection: combineReflection(noticed, carrying),
    });

    setHistory(getHistory());
    setAttestation(kept ? 'kept' : 'not-this-time');
  };

  if (!pledge) return <NoPledge />;
  const hasAttested = attestation !== null;

  return (
    <main className="screen screen--day ceremony-screen ceremony-screen-havdalah">
      <Atmosphere variant="day" />
      <div className={`ceremony-scroll${hasAttested ? ' ceremony-scroll--closing' : ''}`}>
      {!hasAttested ? (
        <section key="reflect" className="ceremony-copy ceremony-havdalah-copy" aria-label="Havdalah">
          <ThreeStars />

          <p className="ceremony-line">Welcome back.</p>

          <div className="ceremony-reflection ceremony-line">
            <label htmlFor="noticed">Before you pick everything back up — what did you notice?</label>
            <textarea id="noticed" value={noticed} onChange={(event) => setNoticed(event.target.value)} />
          </div>

          <div className="ceremony-reflection ceremony-line">
            <label htmlFor="carrying">What will you carry into the week?</label>
            <textarea id="carrying" value={carrying} onChange={(event) => setCarrying(event.target.value)} />
          </div>

          <section className="ceremony-attestation ceremony-line" aria-label="Attestation">
            <p>Did you keep the day, in the way you&nbsp;meant&nbsp;to?</p>
            <div className="ceremony-attestation-actions">
              <button type="button" onClick={() => attest(true)}>I kept it</button>
              <button type="button" onClick={() => attest(false)}>Not this time</button>
            </div>
          </section>
        </section>
      ) : (
        <section
          key="closing"
          className="ceremony-copy ceremony-havdalah-copy ceremony-closing"
          aria-label={attestation === 'kept' ? 'The day was kept. A tile is laid.' : 'A rehearsal'}
        >
          {attestation === 'kept' ? (
            <div className="ceremony-kept">
              <ThreeStars />
              <p className="ceremony-line">The day was kept.</p>
              <p className="ceremony-line">A tile is laid.</p>
              <div className="ceremony-line ceremony-mosaic-wrap">
                <Mosaic history={history} />
              </div>
            </div>
          ) : (
            <p className="ceremony-line ceremony-rehearsal">
              Then it was a rehearsal. The candles will be there next week.
            </p>
          )}

          <section className="ceremony-return ceremony-line">
            <p>
              The old tradition says a second soul visits you for the day of rest, and
              that the spices at havdalah are to comfort you as it leaves.
            </p>
            <p>Take one breath before you go.</p>
            <Link to="/pledge">Want anyone to know?</Link>
            <Link className="ceremony-deeper-door" to="/deeper">
              Where this comes from
            </Link>
          </section>
        </section>
      )}
      </div>
    </main>
  );
}
