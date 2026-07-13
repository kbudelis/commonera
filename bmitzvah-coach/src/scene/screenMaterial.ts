import { MeshBasicNodeMaterial, type Texture } from 'three/webgpu';
import { clamp, float, mix, time, texture, uv, vec3 } from 'three/tsl';
import { createHighlightRig, type HighlightHandle } from './highlightRig';

export interface ScreenMaterialOptions {
  /** darkOnLight = LCD/paper-white screens; lightOnDark = phosphor terminals. */
  mode: 'darkOnLight' | 'lightOnDark';
  textColor: [number, number, number];
  bgColor: [number, number, number];
  /** CRT scanlines. */
  scanlines?: { count: number; strength: number };
  /** Brightness flicker amplitude (CRT). */
  flicker?: number;
  /** Vertical shading toward the bottom (cheap passive-matrix LCD look). */
  bgGradient?: number;
  /** Tint already-visited text (mask fills in as words are touched). */
  visited?: { map: Texture; tint: [number, number, number]; strength?: number };
}

export interface ScreenMaterialResult {
  material: MeshBasicNodeMaterial;
  highlight: HighlightHandle;
  trail: HighlightHandle;
  aux: HighlightHandle;
}

/**
 * Self-lit screens: unlit node material compositing the baked ink ALPHA
 * (screen bakes are white-on-transparent; tint is a material parameter, so
 * one bake serves any phosphor color). Reuses the shared highlight rig, so
 * quiz/tutorial glow behavior is identical to parchment.
 */
export function createScreenMaterial(
  inkTexture: Texture,
  opts: ScreenMaterialOptions,
): ScreenMaterialResult {
  const material = new MeshBasicNodeMaterial();
  const ink = texture(inkTexture);
  const { glow, glowTint, handles } = createHighlightRig();

  const inkMask = ink.a;
  const bg = vec3(...opts.bgColor);
  const baseText = vec3(...opts.textColor);
  const text = opts.visited
    ? mix(
        baseText,
        vec3(...opts.visited.tint),
        texture(opts.visited.map).r.mul(opts.visited.strength ?? 0.8),
      )
    : baseText;

  let lit =
    opts.mode === 'darkOnLight'
      ? // Same compositing sense as parchment: ink over ground, glow brightens ink.
        bg.mul(float(1).sub(inkMask)).add(text.mul(inkMask)).add(glowTint.mul(inkMask.mul(1.4).add(0.25)))
      : // Inverted for phosphor: glow drives TEXT brightness hard; the ground
        // takes only a faint wash or the rect reads as a gray smear.
        bg.add(text.mul(inkMask).mul(glow.mul(1.6).add(1))).add(glowTint.mul(0.1));

  if (opts.bgGradient) {
    lit = lit.mul(float(1).sub(float(opts.bgGradient).mul(float(1).sub(uv().y))));
  }
  if (opts.scanlines) {
    const s = uv().y.mul(opts.scanlines.count * Math.PI * 2).sin().mul(0.5).add(0.5);
    lit = lit.mul(float(1).sub(s.mul(opts.scanlines.strength)));
  }
  if (opts.flicker) {
    lit = lit.mul(time.mul(11.3).sin().mul(opts.flicker).add(1));
  }

  material.colorNode = clamp(lit, 0, 2);
  return { material, ...handles };
}
