import { MeshStandardNodeMaterial, type Texture } from 'three/webgpu';
import { clamp, float, fract, mix, step, texture, uv, vec3 } from 'three/tsl';
import { createHighlightRig, type HighlightHandle } from './highlightRig';

export interface PaperMaterialResult {
  material: MeshStandardNodeMaterial;
  highlight: HighlightHandle;
  trail: HighlightHandle;
  aux: HighlightHandle;
}

/**
 * Continuous-feed printer paper: alternating green-bar banding, fully
 * procedural (no PBR maps), lit so the desk lamp shades the curl.
 */
export function createPaperMaterial(
  inkTexture: Texture,
  opts: { barCount?: number; normal?: Texture; normalScale?: number } = {},
): PaperMaterialResult {
  const { barCount = 14, normal, normalScale = 0.3 } = opts;
  const material = new MeshStandardNodeMaterial();
  if (normal) {
    material.normalMap = normal;
    material.normalScale.set(normalScale, normalScale);
  }
  const ink = texture(inkTexture);
  const { glowTint, handles } = createHighlightRig();

  const band = step(0.5, fract(uv().y.mul(barCount)));
  const bg = mix(vec3(0.875, 0.918, 0.863), vec3(0.949, 0.937, 0.902), band);
  const inkMask = ink.a;
  const lit = mix(bg, ink.rgb, inkMask).add(glowTint.mul(inkMask.mul(1.4).add(0.25)));
  material.colorNode = clamp(lit, 0, 2);
  material.roughnessNode = float(0.9);

  return { material, ...handles };
}
