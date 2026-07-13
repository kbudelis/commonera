import { CanvasTexture, LinearFilter, NearestFilter, SRGBColorSpace } from 'three/webgpu';
import type { ShemaWord } from '../content/types';
import { toScrollText } from '../content/types';
import { SCROLL_FONT } from './fonts';
import { layoutColumn, type ColumnLayout, type WordBox } from './layout';

/** Combining marks (niqqud/cantillation) — enlarged-letter runs index by
    codepoint and would sever a mark from its base letter. */
const HAS_POINTS = /[֑-ׇ]/;

export interface UVRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface BakedWord extends WordBox {
  uvRect: UVRect;
  hitUvRect: UVRect;
}

export interface BakedColumn {
  texture: CanvasTexture;
  words: BakedWord[];
  layout: ColumnLayout;
  canvasWidth: number;
  canvasHeight: number;
}

export interface BakeOptions {
  width?: number;
  height?: number;
  fontPx?: number;
  inkColor?: string;
  /** Fill a parchment-ish background (spike mode). Off = ink-on-transparent for shader compositing. */
  background?: string | null;
  debugRects?: boolean;
  maxAnisotropy?: number;
  /** CSS font-family for the bake (default: the STaM scroll font). */
  font?: string;
  /** Which string of a word to bake (default consonantal via toScrollText;
      pointed eras pass w => w.hePointed). */
  textOf?: (w: ShemaWord) => string;
  /** Hit-rect padding as a fraction of line height — a difficulty knob. */
  hitPadFactor?: number;
  ascentFactor?: number;
  descentFactor?: number;
  /** Post-draw pass over the canvas (e.g. the dot-matrix rasterizer). */
  postProcess?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  /** 'nearest' = chunky unfiltered glyphs (CRT phosphor). */
  filter?: 'smooth' | 'nearest';
}

/** bakeColumn accepts synthesized level tokens too — plain ShemaWords plus layout hints. */
export type BakeWordInput = ShemaWord & { breakBefore?: boolean };

const ENLARGED_SCALE = 1.6;

function pxToUv(r: { x: number; y: number; w: number; h: number }, cw: number, ch: number): UVRect {
  // Canvas y is down; UV v is up.
  return { u0: r.x / cw, v0: 1 - (r.y + r.h) / ch, u1: (r.x + r.w) / cw, v1: 1 - r.y / ch };
}

export function bakeColumn(words: BakeWordInput[], opts: BakeOptions = {}): BakedColumn {
  const {
    width = 2048,
    height = 1024,
    fontPx = 150,
    inkColor = '#241505',
    background = null,
    debugRects = false,
    maxAnisotropy = 8,
    font = SCROLL_FONT,
    textOf = toScrollText,
    hitPadFactor,
    ascentFactor,
    descentFactor,
    postProcess,
    filter = 'smooth',
  } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const layoutWords = words.map((w) => {
    const text = textOf(w);
    return {
      id: w.id,
      text,
      enlarged: HAS_POINTS.test(text) ? undefined : w.flags?.enlarged,
      breakBefore: w.breakBefore,
    };
  });

  // Auto-fit: shrink the font until the column fits its canvas.
  let effectiveFontPx = fontPx;
  let layout;
  for (let attempt = 0; ; attempt++) {
    const px = effectiveFontPx;
    const fontFor = (scale: number) => `${Math.round(px * scale)}px ${font}`;
    const measure = (text: string, scale: number) => {
      ctx.font = fontFor(scale);
      return ctx.measureText(text).width;
    };
    const margin = Math.round(px * 0.8);
    layout = layoutColumn(layoutWords, {
      canvasWidth: width,
      canvasHeight: height,
      fontPx: px,
      lineHeightFactor: 1.65,
      margin,
      enlargedScale: ENLARGED_SCALE,
      measure,
      hitPadFactor,
      ascentFactor,
      descentFactor,
    });
    const used = margin * 2 + layout.lineCount * layout.lineHeight;
    if (used <= height || attempt >= 4) break;
    effectiveFontPx = Math.floor(effectiveFontPx * Math.sqrt(height / used) * 0.98);
  }
  const fontFor = (scale: number) => `${Math.round(effectiveFontPx * scale)}px ${font}`;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = inkColor;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'rtl';
  for (const box of layout.boxes) {
    for (const run of box.runs) {
      ctx.font = fontFor(run.scale);
      ctx.fillText(run.text, run.xRight, box.baseline);
    }
  }

  postProcess?.(ctx, canvas);

  if (debugRects) {
    ctx.lineWidth = 3;
    for (const box of layout.boxes) {
      ctx.strokeStyle = 'rgba(200, 40, 40, 0.9)';
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = 'rgba(40, 120, 200, 0.6)';
      ctx.strokeRect(box.hit.x, box.hit.y, box.hit.w, box.hit.h);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  if (filter === 'nearest') {
    texture.magFilter = NearestFilter;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
  } else {
    texture.generateMipmaps = true;
  }

  const baked: BakedWord[] = layout.boxes.map((box) => ({
    ...box,
    uvRect: pxToUv(box, width, height),
    hitUvRect: pxToUv(box.hit, width, height),
  }));

  return { texture, words: baked, layout, canvasWidth: width, canvasHeight: height };
}
