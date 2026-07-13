import { Link } from 'react-router-dom';
import { Atmosphere } from '../shared/Atmosphere';
import './ceremony.css';

/*
  The "go deeper" door — reached only from the Havdalah return section,
  after a completed rest (2026-07-11 client call: the door appears once the
  experience has wooed somebody, never before). Copy is canonical:
  contracts/copy.md, "Go deeper" addendum.
*/
export default function Deeper() {
  return (
    <main className="screen screen--day ceremony-screen ceremony-deeper">
      <Atmosphere variant="day" />
      <div className="ceremony-scroll">
      <section className="ceremony-copy ceremony-deeper-copy" aria-label="Where this comes from">
        <p className="ceremony-line ceremony-deeper-heading">People have always known how to do this.</p>
        <p className="ceremony-line">
          Long before screen-time reports, wisdom traditions around the world set aside protected
          time and guarded it carefully. The shape this practice borrows is Shabbat: one day in
          seven, set apart — not a pause so you can work better after, but a sanctuary built in
          time, arrived at weekly, kept with people you love.
        </p>
        <p className="ceremony-line">There&apos;s nothing more you need to know to keep your day.</p>
        <p className="ceremony-line">
          But if the day starts to feel like it belongs to something older — it does.
        </p>
        <p className="ceremony-line">
          <Link className="ceremony-deeper-return" to="/pledge">
            Back to your pledge
          </Link>
        </p>
      </section>
      </div>
    </main>
  );
}
