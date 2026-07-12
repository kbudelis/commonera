import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Pledge.css';
import { getPledge, type Pledge } from '../shared/store';
import { PRODUCT_NAME } from '../shared/brand';
import { Atmosphere } from '../shared/Atmosphere';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 1600;
const MICROGRAPHY_FONT_SIZE = 12;

type ExportMode = 'png' | 'share' | null;
type WrappedText = {
  lines: string[];
  truncated: boolean;
};
type IntentionLayout = {
  lines: string[];
  fontSize: number;
  lineGap: number;
  firstY: number;
};
const exportFailureCopy = "That didn't work. Try once more.";

function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function cleanList(values?: string[]): string[] {
  return values?.map((value) => value.trim()).filter(Boolean) ?? [];
}

function formatTiming(pledge: Pledge): string {
  const start = new Date(pledge.timing.start);
  const end = new Date(pledge.timing.end);
  const sameYear = start.getFullYear() === end.getFullYear();
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dayFormatter.format(start)}, ${timeFormatter.format(start)} to ${dayFormatter.format(end)}, ${timeFormatter.format(end)}`;
}

function summarizePledge(pledge: Pledge): string {
  if (pledge.pledge.tier === 'full') {
    return 'all screens, phone off or in a drawer';
  }

  if (pledge.pledge.tier === 'all_in') {
    const exceptions = cleanList(pledge.pledge.exceptions);
    return exceptions.length > 0 ? `everything except ${exceptions.join(', ')}` : 'everything except what you name';
  }

  const items = cleanList(pledge.pledge.items);
  return items.length > 0 ? items.join(', ') : 'Pick your items';
}

function micrographySource(pledge: Pledge): string {
  const parts = [
    cleanText(pledge.intention),
    ...cleanList(pledge.pledge.items),
    ...cleanList(pledge.pledge.exceptions),
    cleanText(pledge.substitute),
    cleanText(pledge.phoneHome),
  ].filter((part): part is string => Boolean(part));

  return parts.join(' · ');
}

function repeatForBorder(text: string): string {
  const source = text.trim() || 'One day, set apart.';
  const phrase = `${source} · `;
  return phrase.repeat(Math.ceil(1100 / phrase.length) + 1);
}

function wrapWords(text: string, maxChars: number, maxLines: number): WrappedText {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  let truncated = false;

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;

      if (lines.length === maxLines) {
        truncated = true;
        current = '';
        break;
      }
    } else {
      current = next;
    }
  }

  if (current) {
    if (lines.length < maxLines) {
      lines.push(current);
    } else {
      truncated = true;
    }
  }

  return {
    lines: lines.slice(0, maxLines),
    truncated,
  };
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const wrapped = wrapWords(text, maxChars, maxLines);

  if (wrapped.truncated && wrapped.lines.length > 0) {
    const lines = [...wrapped.lines];
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.*$/, '')}...`;
    return lines;
  }

  return wrapped.lines;
}

function layoutIntention(text: string): IntentionLayout {
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  // narrower measures than before: the intention now sits inside the arch
  const configs = hasHebrew
    ? [
        { maxChars: 16, maxLines: 4, fontSize: 54, lineGap: 60 },
        { maxChars: 20, maxLines: 5, fontSize: 48, lineGap: 54 },
        { maxChars: 24, maxLines: 6, fontSize: 42, lineGap: 48 },
      ]
    : [
        { maxChars: 18, maxLines: 3, fontSize: 76, lineGap: 86 },
        { maxChars: 22, maxLines: 4, fontSize: 60, lineGap: 66 },
        { maxChars: 28, maxLines: 5, fontSize: 52, lineGap: 58 },
        { maxChars: 34, maxLines: 6, fontSize: 44, lineGap: 50 },
      ];

  let fallback: IntentionLayout | null = null;

  for (const config of configs) {
    const wrapped = wrapWords(text, config.maxChars, config.maxLines);
    const lines = wrapped.truncated ? wrapText(text, config.maxChars, config.maxLines) : wrapped.lines;
    const firstY = 240 - ((lines.length - 1) * config.lineGap) / 2;
    const layout = { lines, fontSize: config.fontSize, lineGap: config.lineGap, firstY };

    if (!wrapped.truncated) {
      return layout;
    }

    fallback = layout;
  }

  return fallback ?? { lines: [], fontSize: 76, lineGap: 86, firstY: 240 };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

let embeddedFontCss: string | null = null;

async function fontToDataUri(path: string, mime: string): Promise<string | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

/* An SVG rasterized through an <img> cannot reach document fonts, so the
   card's fonts are embedded as data URIs at export time. */
async function getEmbeddedFontCss(): Promise<string> {
  if (embeddedFontCss !== null) return embeddedFontCss;

  const [newsreader, noCigar] = await Promise.all([
    fontToDataUri('/fonts/newsreader-latin.woff2', 'font/woff2'),
    fontToDataUri('/fonts/OTRNoCigarRegular.woff', 'font/woff'),
  ]);

  const rules: string[] = [];
  if (newsreader) {
    rules.push(`@font-face{font-family:'Newsreader';src:url(${newsreader}) format('woff2');font-weight:200 800;}`);
  }
  if (noCigar) {
    rules.push(`@font-face{font-family:'OTR No Cigar';src:url(${noCigar}) format('woff');}`);
  }

  embeddedFontCss = rules.join('');
  return embeddedFontCss;
}

async function serializeSvg(svg: SVGSVGElement): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(CARD_WIDTH));
  clone.setAttribute('height', String(CARD_HEIGHT));

  const fontCss = await getEmbeddedFontCss();
  if (fontCss) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = fontCss;
    clone.insertBefore(style, clone.firstChild);
  }

  return new XMLSerializer().serializeToString(clone);
}

async function waitForFonts(sampleText: string): Promise<void> {
  const sample = sampleText.trim() || 'One day, set apart.';

  try {
    await Promise.allSettled([
      document.fonts?.load('600 88px "Newsreader"', sample),
      document.fonts?.load('400 48px "Newsreader"', sample),
      document.fonts?.load('400 28px "OTR No Cigar"', sample),
    ]);
    await document.fonts?.ready;
  } catch {
    // Font loading failure should not block export; it only prevents a best-effort wait.
  }
}

async function svgToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  await waitForFonts(svg.textContent ?? '');

  const svgBlob = new Blob([await serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas is unavailable.'));
        return;
      }

      context.drawImage(image, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('PNG export failed.'));
        }
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG export failed.'));
    };
    image.src = url;
  });
}

function isShareCancellation(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export default function PledgeRoute() {
  const pledge = useMemo(getPledge, []);

  if (!pledge) {
    return (
      <main className="screen screen--night pledgePage">
        <Atmosphere variant="dusk-deep" />
        <div className="pledgePageInner pledgeEmpty">
          <p className="pledgeEmptyLine">Nothing is pledged yet.</p>
          <Link className="pledgeLink" to="/design">
            Design my day
          </Link>
        </div>
      </main>
    );
  }

  return <PledgeView pledge={pledge} />;
}

function PledgeView({ pledge }: { pledge: Pledge }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [exportMode, setExportMode] = useState<ExportMode>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const rawId = useId().replace(/:/g, '');
  const displayName = cleanText(pledge.name);
  const intention = cleanText(pledge.intention) ?? '';
  const intentionLayout = useMemo(() => layoutIntention(intention), [intention]);
  const timing = useMemo(() => formatTiming(pledge), [pledge]);
  const summary = useMemo(() => summarizePledge(pledge), [pledge]);
  const micrography = useMemo(() => repeatForBorder(micrographySource(pledge)), [pledge]);
  const titleId = `${rawId}-title`;
  const micrographyPathId = `${rawId}-micrography-path`;

  async function handleDownloadPng(): Promise<void> {
    if (!svgRef.current || exportMode) {
      return;
    }

    setExportMode('png');
    setExportError(null);
    try {
      const blob = await svgToPngBlob(svgRef.current);
      downloadBlob(blob, 'keep-pledge.png');
    } catch {
      setExportError(exportFailureCopy);
    } finally {
      setExportMode(null);
    }
  }

  async function handleShare(): Promise<void> {
    if (!svgRef.current || exportMode) {
      return;
    }

    setExportMode('share');
    setExportError(null);
    try {
      const blob = await svgToPngBlob(svgRef.current);
      const file = new File([blob], 'keep-pledge.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'One day, set apart.',
          });
        } catch (error) {
          if (!isShareCancellation(error)) {
            setExportError(exportFailureCopy);
          }
        }
        return;
      }

      downloadBlob(blob, 'keep-pledge.png');
    } catch {
      setExportError(exportFailureCopy);
    } finally {
      setExportMode(null);
    }
  }

  return (
    <main className="screen screen--night pledgePage">
      <Atmosphere variant="dusk-deep" />
      <div className="pledgePageInner">
        <div className="pledgeCardFrame">
          <svg
            ref={svgRef}
            className="pledgeCardSvg"
            viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
            role="img"
            aria-labelledby={titleId}
          >
            <title id={titleId}>One day, set apart.</title>
            <defs>
              <filter id={`${rawId}-gold-glow`} x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#C98A2B" floodOpacity="0.4" />
              </filter>
              <filter id={`${rawId}-grain`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" result="noise" />
                <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.92  0 0 0 0 0.85  0 0 0 0.05 0" />
              </filter>
              <path
                id={micrographyPathId}
                d="M 128 92 H 1072 A 36 36 0 0 1 1108 128 V 1472 A 36 36 0 0 1 1072 1508 H 128 A 36 36 0 0 1 92 1472 V 128 A 36 36 0 0 1 128 92 Z"
                fill="none"
              />
              <path
                id={`${micrographyPathId}-arch`}
                d="M 236 1120 V 620 A 364 364 0 0 1 964 620 V 1120"
                fill="none"
              />
            </defs>

            {/* deep-indigo field with print grain (SVG-native, survives PNG export) */}
            <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="#161C2E" />
            <rect width={CARD_WIDTH} height={CARD_HEIGHT} filter={`url(#${rawId}-grain)`} />

            {/* outer course — their own words as the document's border */}
            <text
              fill="#F4ECDC"
              opacity="0.42"
              fontFamily="Newsreader, Georgia, serif"
              fontSize={MICROGRAPHY_FONT_SIZE}
              letterSpacing="1.4"
            >
              <textPath href={`#${micrographyPathId}`} startOffset="0">
                {micrography}
              </textPath>
            </text>

            {/* the gate: hairline arch courses with a second run of their words */}
            <path
              d="M 252 1120 V 620 A 348 348 0 0 1 948 620 V 1120"
              fill="none"
              stroke="#C98A2B"
              strokeWidth="1.4"
              opacity="0.62"
            />
            <path
              d="M 268 1120 V 620 A 332 332 0 0 1 932 620 V 1120"
              fill="none"
              stroke="#C98A2B"
              strokeWidth="0.8"
              opacity="0.3"
            />
            <text
              fill="#C98A2B"
              opacity="0.6"
              fontFamily="Newsreader, Georgia, serif"
              fontStyle="italic"
              fontSize="10.5"
              letterSpacing="1.8"
            >
              <textPath href={`#${micrographyPathId}-arch`} startOffset="0">
                {micrography}
              </textPath>
            </text>

            <g transform="translate(540 356)" filter={`url(#${rawId}-gold-glow)`}>
              <circle cx="26" cy="22" r="6" fill="#E8B84B" />
              <circle cx="72" cy="8" r="4.5" fill="#E8B84B" />
              <circle cx="94" cy="44" r="5.5" fill="#E8B84B" />
            </g>

            <g transform="translate(166 640)">
              <text
                x="434"
                y={intentionLayout.firstY}
                textAnchor="middle"
                fill="#F4ECDC"
                fontFamily="Newsreader, Georgia, serif"
                fontSize={intentionLayout.fontSize}
                fontWeight="500"
                letterSpacing="-0.5"
                dominantBaseline="middle"
              >
                {intentionLayout.lines.map((line, index) => (
                  <tspan key={`${line}-${index}`} x="434" dy={index === 0 ? 0 : intentionLayout.lineGap}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>

            {displayName ? (
              <text
                x="600"
                y="1204"
                textAnchor="middle"
                fill="#F4ECDC"
                opacity="0.82"
                fontFamily="Newsreader, Georgia, serif"
                fontStyle="italic"
                fontSize="42"
                letterSpacing="0"
              >
                {displayName} is keeping a day, set apart.
              </text>
            ) : null}

            <text
              x="600"
              y={displayName ? 1276 : 1220}
              textAnchor="middle"
              fill="#F4ECDC"
              opacity="0.66"
              fontFamily="OTR No Cigar, Avenir Next Condensed, sans-serif"
              fontSize="21"
              letterSpacing="4"
            >
              {wrapText(`${timing} · setting down ${summary}`, 44, 3).map((line, index) => (
                <tspan key={`${line}-${index}`} x="600" dy={index === 0 ? 0 : 40}>
                  {line}
                </tspan>
              ))}
            </text>

            <line x1="472" x2="728" y1="1396" y2="1396" stroke="#C98A2B" strokeWidth="1.2" opacity="0.7" />
            <text
              x="600"
              y="1448"
              textAnchor="middle"
              fill="#F4ECDC"
              fontFamily="Newsreader, Georgia, serif"
              fontStyle="italic"
              fontSize="38"
              letterSpacing="0"
            >
              One day, set apart.
            </text>
            <text
              x="600"
              y="1490"
              textAnchor="middle"
              fill="#C98A2B"
              opacity="0.85"
              fontFamily="OTR No Cigar, Avenir Next Condensed, sans-serif"
              fontSize="15"
              letterSpacing="7"
            >
              {PRODUCT_NAME.toUpperCase()}
            </text>
          </svg>
        </div>

        <div className="pledgeActions" aria-busy={exportMode ? 'true' : undefined}>
          <p className="pledgeNext">Your day is set. It begins when you light the candles.</p>
          <Link className="pledgeAction pledgeAction--begin" to="/candle" aria-disabled={exportMode ? 'true' : undefined}>
            Light the candles
            <svg className="pledgeAction__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="pledgeKeepLabel">Or keep a copy of the card</p>
          <button className="pledgeAction" type="button" onClick={handleDownloadPng} disabled={exportMode !== null}>
            <svg className="pledgeAction__icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2.5v7m0 0 3-3m-3 3-3-3M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save the card
          </button>
          <button className="pledgeAction" type="button" onClick={handleShare} disabled={exportMode !== null}>
            <svg className="pledgeAction__icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 9.5v-7m0 0L5 5.5m3-3 3 3M3.5 8v5h9V8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Send the card
          </button>
          <p className="pledgeKeepHint">Set it as your phone&apos;s lock screen — a quiet reminder all week.</p>
          <Link className="pledgeLink" to="/design" aria-disabled={exportMode ? 'true' : undefined}>
            Adjust your pledge
          </Link>
        </div>
        {exportError ? (
          <p className="pledgeExportError" role="status">
            {exportError}
          </p>
        ) : null}
      </div>
    </main>
  );
}
