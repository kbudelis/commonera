import { Link } from 'react-router-dom';
import { Atmosphere } from '../shared/Atmosphere';
import './ceremony.css';

export default function NoPledge() {
  return (
    <main className="screen screen--night ceremony-screen ceremony-no-pledge" aria-label="The candles aren't lit yet.">
      <Atmosphere variant="night" />
      <section className="ceremony-copy ceremony-no-pledge-copy">
        <p>The candles aren&apos;t lit yet.</p>
        <Link to="/design">Design my day</Link>
      </section>
    </main>
  );
}
