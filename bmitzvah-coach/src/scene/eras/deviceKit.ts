import {
  CanvasTexture,
  MeshStandardNodeMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  type Texture,
} from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Shared kit for the era devices: CC0 PBR maps (ambientCG, see
 * assets-src/licenses/device-textures-CC0.txt), rounded silhouettes, and
 * canvas-drawn detail textures. Loaded maps live in a module cache shared by
 * every session — era dispose() must NOT touch them.
 */

export type DeviceTex = 'wood' | 'plastic' | 'leather' | 'metal';

const loader = new TextureLoader();
const cache = new Map<string, Texture>();

function pbrMap(name: DeviceTex, kind: 'albedo' | 'normal' | 'rough', repeat: number): Texture {
  const key = `${name}_${kind}@${repeat}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = loader.load(`${import.meta.env.BASE_URL}textures/${name}_${kind}.webp`);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeat, repeat);
  if (kind === 'albedo') t.colorSpace = SRGBColorSpace;
  cache.set(key, t);
  return t;
}

export interface DeviceMaterialOptions {
  tex: DeviceTex;
  /** Tint multiplied over the albedo (or the flat color when `albedo: false`). */
  color?: string;
  /** Skip the color map (near-uniform albedos fight era tints) but keep normal + roughness. */
  albedo?: boolean;
  /** Multiplier over the roughness map. */
  roughness?: number;
  metalness?: number;
  repeat?: number;
  normalScale?: number;
}

/** A lit standard material dressed in one of the CC0 PBR sets. */
export function deviceMaterial(opts: DeviceMaterialOptions): MeshStandardNodeMaterial {
  const {
    tex,
    color = '#ffffff',
    albedo = true,
    roughness = 1,
    metalness = 0,
    repeat = 1,
    normalScale = 1,
  } = opts;
  const m = new MeshStandardNodeMaterial({ color, roughness, metalness });
  if (albedo) m.map = pbrMap(tex, 'albedo', repeat);
  m.normalMap = pbrMap(tex, 'normal', repeat);
  m.normalScale = new Vector2(normalScale, normalScale);
  m.roughnessMap = pbrMap(tex, 'rough', repeat);
  return m;
}

/** Rounded-corner box — the single cheapest cure for "primitive chunkiness". */
export function roundedBox(
  w: number,
  h: number,
  d: number,
  radius: number,
  segments = 3,
): RoundedBoxGeometry {
  return new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, Math.min(w, h, d) / 2));
}

export interface KeyboardTextureOptions {
  /** Deck color behind the keys. */
  base?: string;
  /** Keycap top face. */
  keyTop?: string;
  /** Keycap side/shadow under the top face. */
  keySide?: string;
}

/** Rounded-rect key grid drawn in 2D — one texture instead of seventy meshes. */
export function keyboardTexture(opts: KeyboardTextureOptions = {}): CanvasTexture {
  const { base = '#a8a294', keyTop = '#c2bcae', keySide = '#8d887b' } = opts;
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 384;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  const rows = 5;
  const pad = 10;
  const keyH = (c.height - pad * 2) / rows - 8;
  for (let r = 0; r < rows; r++) {
    const y = pad + r * (keyH + 8);
    const keys = r === rows - 1 ? 8 : 14 + (r % 2);
    const keyW = (c.width - pad * 2) / keys - 7;
    for (let k = 0; k < keys; k++) {
      const x = pad + k * (keyW + 7);
      const w = r === rows - 1 && k === 3 ? keyW * 3.2 : keyW; // space bar
      g.fillStyle = keySide;
      g.beginPath();
      g.roundRect(x + 2, y + 3, w, keyH, 5);
      g.fill();
      g.fillStyle = keyTop;
      g.beginPath();
      g.roundRect(x, y, w, keyH, 5);
      g.fill();
      if (r === rows - 1 && k === 3) k += 2;
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
