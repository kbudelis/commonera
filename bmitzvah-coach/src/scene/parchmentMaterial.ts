import { MeshStandardNodeMaterial, RepeatWrapping, type Texture } from 'three/webgpu';
import {
  clamp,
  float,
  mix,
  mx_noise_float,
  smoothstep,
  texture,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import { createHighlightRig, type HighlightHandle } from './highlightRig';

export type { HighlightHandle } from './highlightRig';

export interface ParchmentMaterialResult {
  material: MeshStandardNodeMaterial;
  highlight: HighlightHandle;
  /** Secondary rect used as the scrub trail (fades out on its own). */
  trail: HighlightHandle;
  /** Third rect for tutorial pulses / quiz choices. */
  aux: HighlightHandle;
}

/** Era knobs — every default reproduces the Torah scroll's look exactly. */
export interface ParchmentStyle {
  /** Tint away from the edges (lighter, cleaner). */
  ageTintCenter?: [number, number, number];
  /** Tint at the handled edges (browner). */
  ageTintEdge?: [number, number, number];
  /** Strength of the fbm stain blotches. */
  blotch?: number;
  /** Darkness floor of the edge vignette (lower = darker edges). */
  edgeVignette?: number;
  /** Faint horizontal ruling (sirtut) for the manuscript era. */
  ruledLines?: { count: number; strength: number };
}

/**
 * Parchment + ink compositing in TSL. The ink texture is baked
 * near-black-on-transparent; its alpha is the ink mask. Highlights are
 * uniform UV rects — 5 floats per change, no texture re-uploads.
 * Compiles to WGSL and GLSL alike (WebGL2 fallback included).
 */
export function createParchmentMaterial(
  inkTexture: Texture,
  pbr: { albedo: Texture; normal: Texture; rough: Texture },
  style: ParchmentStyle = {},
): ParchmentMaterialResult {
  const {
    ageTintCenter = [1.0, 0.96, 0.86],
    ageTintEdge = [1.0, 0.9, 0.72],
    blotch: blotchStrength = 0.09,
    edgeVignette = 0.72,
    ruledLines,
  } = style;

  for (const t of [pbr.albedo, pbr.normal, pbr.rough]) {
    t.wrapS = t.wrapT = RepeatWrapping;
  }

  const material = new MeshStandardNodeMaterial();

  const ink = texture(inkTexture);

  // Weathering: darkened edges (handled parchment) + slow fbm blotches.
  const p = uv();
  const edgeFade = smoothstep(0.0, 0.16, p.x)
    .mul(smoothstep(1.0, 0.84, p.x))
    .mul(smoothstep(0.0, 0.1, p.y))
    .mul(smoothstep(1.0, 0.9, p.y));
  const vignette = mix(float(edgeVignette), float(1.0), edgeFade);
  const blotch = mx_noise_float(p.mul(vec2(5, 3)))
    .mul(0.6)
    .add(mx_noise_float(p.mul(vec2(14, 9))).mul(0.4));
  let stain = vignette.mul(float(1.0).sub(blotch.mul(blotchStrength)));
  if (ruledLines) {
    // Sirtut: thin darkened bands at every ruled line.
    const fy = p.y.mul(ruledLines.count).fract().sub(0.5).abs();
    const lineMask = smoothstep(0.05, 0.015, fy);
    stain = stain.mul(float(1.0).sub(lineMask.mul(ruledLines.strength)));
  }
  const ageTint = mix(vec3(...ageTintEdge), vec3(...ageTintCenter), edgeFade); // browner edges
  const paper = texture(pbr.albedo).mul(ageTint).mul(stain);

  const { glow, glowTint, handles } = createHighlightRig();
  const inkMask = ink.a;

  const inked = mix(paper, ink.rgb, inkMask);
  // Ink glows bright under highlight; parchment tints faintly.
  const lit = inked.add(glowTint.mul(inkMask.mul(1.4).add(0.25)));
  material.colorNode = clamp(lit, 0, 2);

  material.normalMap = pbr.normal;
  // Ink is barely glossier than parchment — too much reads as faded ink
  // under specular at glancing angles.
  material.roughnessNode = clamp(
    texture(pbr.rough).r.mul(float(1).sub(inkMask.mul(0.12))).mul(float(1).sub(glow.mul(0.1))),
    0.55,
    1,
  );

  return { material, ...handles };
}
