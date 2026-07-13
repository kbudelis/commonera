#!/usr/bin/env node
// Temporary dev helper: screenshot a mini level's live scene (clicks intro CTA).
//   node tools/era-shot.mjs <level> <out.png>
import { chromium } from 'playwright';

const level = Number(process.argv[2] ?? 1);
const out = process.argv[3] ?? `/tmp/era-l${level}.png`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(`http://localhost:5199/?forceWebGL=1&level=${level}`, { waitUntil: 'networkidle' });
await p.waitForSelector('#level-intro #go', { timeout: 15000 });
await p.click('#level-intro #go');
await p.waitForFunction(() => window.__shema?.camSettled(), null, { timeout: 15000 });
await p.waitForTimeout(1000);
await p.screenshot({ path: out });
console.log(out, errs.length ? 'ERRORS: ' + errs.join('\n') : 'no page errors');
await b.close();
