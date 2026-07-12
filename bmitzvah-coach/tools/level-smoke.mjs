#!/usr/bin/env node
// Mini-level smoke test: jump to ?level=N, click through the intro, hover
// every counting token, and assert the completion card appears.
//   node tools/level-smoke.mjs <level 1-5> [shot-prefix]
import { chromium } from 'playwright';

const level = Number(process.argv[2] ?? 2);
const shots = process.argv[3] ?? `/tmp/level${level}`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const state = async () => await page.evaluate(() => window.__shema?.state());
const shot = (name) => page.screenshot({ path: `${shots}-${name}.png` });

await page.goto(`http://localhost:5199/?forceWebGL=1&level=${level}`, { waitUntil: 'networkidle' });
await page.waitForSelector('#level-intro #go', { timeout: 15000 });
await shot('intro');
await page.click('#level-intro #go');
await page.waitForFunction(() => window.__shema?.camSettled(), null, { timeout: 15000 });
console.log('state after intro:', JSON.stringify(await state()));
await shot('level');

const ids = await page.evaluate(() => window.__shema.wordIds());
console.log(`${ids.length} counting tokens`);
for (const id of ids) {
  const p = await page.evaluate((i) => window.__shema.wordScreenPos(i), id);
  if (!p) { console.log('no pos for', id); continue; }
  await page.mouse.move(p.x, p.y, { steps: 5 });
  await page.waitForTimeout(260);
}
// Retrace anything the sweep missed (highlight fades can eat fast hovers).
const touched = await page.evaluate(() => window.__shema.touched());
const missing = ids.filter((i) => !touched.includes(i));
if (missing.length) {
  console.log('retracing:', missing.join(' '));
  for (const id of missing) {
    const p = await page.evaluate((i) => window.__shema.wordScreenPos(i), id);
    if (!p) continue;
    await page.mouse.move(p.x + 30, p.y + 20, { steps: 3 });
    await page.mouse.move(p.x, p.y, { steps: 6 });
    await page.waitForTimeout(420);
  }
}
await shot('traced');
await page.waitForSelector('#level-complete', { timeout: 8000 });
console.log('completion card shown ✓');
await shot('complete');
await page.click('#level-complete #on');
await page.waitForTimeout(900);
console.log('state after complete:', JSON.stringify(await state()));
await shot('after');
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
await browser.close();
