import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from 'react-router-dom';

const Landing = lazy(() => import('./landing/Landing.tsx'));
const Design = lazy(() => import('./intake/Design.tsx'));
const Pledge = lazy(() => import('./artifact/Pledge.tsx'));
const Candle = lazy(() => import('./ceremony/Candle.tsx'));
const Havdalah = lazy(() => import('./ceremony/Havdalah.tsx'));
const Deeper = lazy(() => import('./ceremony/Deeper.tsx'));

const Field = lazy(() => import('./intake/Field.tsx'));

function QuietFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

/*
  The main link opens to the front door — always. The landing is the title
  page; its one button opens the demo (the intake at /design). No auto-resume
  into the middle of the ritual: this is a walk-through, and it starts at the
  start every time.
*/
function RoutedApp() {
  return (
    <div className="stage">
      <Suspense fallback={<QuietFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/welcome" element={<Landing />} />
          <Route path="/app" element={<Landing />} />
          <Route path="/design" element={<Design />} />
          <Route path="/pledge" element={<Pledge />} />
          <Route path="/candle" element={<Candle />} />
          <Route path="/havdalah" element={<Havdalah />} />
          <Route path="/field" element={<Field />} />
          <Route path="/deeper" element={<Deeper />} />
          <Route
            path="*"
            element={
              <main className="screen screen--day not-found" aria-labelledby="not-found-title">
                <h1 id="not-found-title">There's no page here.</h1>
                <Link to="/">Give your week its shape back.</Link>
              </main>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  // Root deploys leave BASE_URL at '/'; the sprint-site deploy serves us from
  // /<repo>/<project>/, and the router must strip that prefix before matching.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <RoutedApp />
    </BrowserRouter>
  );
}
