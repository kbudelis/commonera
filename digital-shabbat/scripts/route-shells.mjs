/*
  Static hosts with no rewrite support (GitHub Pages) can't honor
  public/_redirects, so every client-side route gets a physical copy of the
  app shell instead: dist/<route>/index.html. The shell's asset URLs are
  absolute (they carry Vite's base), so the copies work from any depth.
  On Cloudflare these files simply pre-empt the _redirects rewrites with the
  identical shell. Keep ROUTES in step with _redirects and App.tsx.
*/
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROUTES = ['welcome', 'design', 'pledge', 'candle', 'havdalah', 'field', 'deeper'];

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const shell = join(dist, 'app', 'index.html');

for (const route of ROUTES) {
  const dir = join(dist, route);
  mkdirSync(dir, { recursive: true });
  copyFileSync(shell, join(dir, 'index.html'));
}
console.log(`route-shells: app shell copied to ${ROUTES.length} routes`);
