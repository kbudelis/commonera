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
 * Machine paper, fully procedural (no albedo map), lit so the lamp shades
 * the curl. Defaults are green-bar tractor feed; pass matching `colors`
 * for plain typing stock.
 */
export function createPaperMaterial(
  inkTexture: Texture,
  opts: {
    barCount?: number;
    /** [bar, gap] paper colors — make them equal for unbanded stock. */
    colors?: [[number, number, number], [number, number, number]];
    normal?: Texture;
    normalScale?: number;
    /** Tint already-visited ink (mask fills in as words are touched). */
    visited?: { map: Texture; tint: [number, number, number]; strength?: number };
  } = {},
): PaperMaterialResult {
  const {
    barCount = 14,
    colors = [
      [0.875, 0.918, 0.863],
      [0.949, 0.937, 0.902],
    ],
    normal,
    normalScale = 0.3,
  } = opts;
  const material = new MeshStandardNodeMaterial();
  if (normal) {
    material.normalMap = normal;
    material.normalScale.set(normalScale, normalScale);
  }
  const ink = texture(inkTexture);
  const { glowTint, handles } = createHighlightRig();

  const band = step(0.5, fract(uv().y.mul(barCount)));
  const bg = mix(vec3(...colors[0]), vec3(...colors[1]), band);
  const inkMask = ink.a;
  let inkColor = ink.rgb;
  if (opts.visited) {
    const seen = texture(opts.visited.map).r.mul(opts.visited.strength ?? 0.8);
    inkColor = mix(inkColor, vec3(...opts.visited.tint), seen);
  }
  const lit = mix(bg, inkColor, inkMask).add(glowTint.mul(inkMask.mul(1.4).add(0.25)));
  material.colorNode = clamp(lit, 0, 2);
  material.roughnessNode = float(0.9);

  return { material, ...handles };
}
