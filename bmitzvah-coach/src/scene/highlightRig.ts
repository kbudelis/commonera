import { add, smoothstep, time, uniform, uv, vec3, vec4 } from 'three/tsl';

export interface HighlightHandle {
  /** Set the highlighted UV rect (u0, v0, u1, v1) and fade it in. */
  show(rect: { u0: number; v0: number; u1: number; v1: number }): void;
  /** Fade out. */
  hide(): void;
  /** Call each frame with delta seconds to tween strength. */
  update(dt: number): void;
  /** Change the glow color (default warm gold). */
  setColor(r: number, g: number, b: number): void;
}

export interface HighlightHandles {
  highlight: HighlightHandle;
  /** Secondary rect used as the scrub trail (fades out on its own). */
  trail: HighlightHandle;
  /** Third rect for tutorial pulses / quiz choices. */
  aux: HighlightHandle;
}

const FEATHER = 0.006;
const ATTACK = 0.08;
const RELEASE = 0.3;

/**
 * The three uniform UV-rect glow handles every era material composes —
 * 5 floats per change, no texture re-uploads. Extracted verbatim from the
 * parchment material so handle semantics/timings stay identical across eras.
 */
export function createHighlightRig() {
  const makeRectUniforms = () => ({
    rect: uniform(vec4(0, 0, 0, 0)),
    strength: uniform(0),
    color: uniform(vec3(1.0, 0.78, 0.25)),
  });
  const h1 = makeRectUniforms();
  const h2 = makeRectUniforms();
  const h3 = makeRectUniforms();

  const rectGlow = (u: ReturnType<typeof makeRectUniforms>) => {
    const p = uv();
    const inside = smoothstep(u.rect.x.sub(FEATHER), u.rect.x.add(FEATHER), p.x)
      .mul(smoothstep(u.rect.z.add(FEATHER), u.rect.z.sub(FEATHER), p.x))
      .mul(smoothstep(u.rect.y.sub(FEATHER), u.rect.y.add(FEATHER), p.y))
      .mul(smoothstep(u.rect.w.add(FEATHER), u.rect.w.sub(FEATHER), p.y));
    const breathe = time.mul(3).sin().mul(0.15).add(0.85);
    return inside.mul(u.strength).mul(breathe);
  };

  const glow = add(add(rectGlow(h1), rectGlow(h2)), rectGlow(h3));
  const glowTint = add(
    add(h1.color.mul(rectGlow(h1)), h2.color.mul(rectGlow(h2))),
    h3.color.mul(rectGlow(h3)),
  );

  const makeHandle = (u: ReturnType<typeof makeRectUniforms>): HighlightHandle => {
    let target = 0;
    return {
      show(rect) {
        u.rect.value.set(rect.u0, rect.v0, rect.u1, rect.v1);
        target = 1;
      },
      hide() {
        target = 0;
      },
      update(dt) {
        const cur = u.strength.value as number;
        const rate = target > cur ? dt / ATTACK : dt / RELEASE;
        u.strength.value = cur + Math.sign(target - cur) * Math.min(rate, Math.abs(target - cur));
      },
      setColor(r, g, b) {
        u.color.value.set(r, g, b);
      },
    };
  };

  const handles: HighlightHandles = {
    highlight: makeHandle(h1),
    trail: makeHandle(h2),
    aux: makeHandle(h3),
  };
  return { glow, glowTint, handles };
}
