import { Link } from 'react-router-dom';
import { PRODUCT_NAME } from '../shared/brand';
import { Atmosphere, WordRing } from '../shared/Atmosphere';
import '../styles/landing.css';

export default function Landing() {
  return (
    <main className="screen screen--day arrival" aria-labelledby="arrival-title">
      <Atmosphere variant="day" plate="/plates/landing-dawn.webp" />

      <div className="arrival__emblem">
        <WordRing className="arrival__ring" tone="ink" />
        <p className="arrival__mark">{PRODUCT_NAME}</p>
      </div>

      <div className="arrival__foot">
        <div className="arrival__copy">
          <h1 className="arrival__title" id="arrival-title">
            Give your week its <em>shape</em> back.
          </h1>
          <p className="arrival__sub">
            One day, set apart. A three-thousand-year-old answer to a very new kind of&nbsp;tired.
          </p>
        </div>

        <Link className="stone arrival__stone" to="/design" aria-label="Begin">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
