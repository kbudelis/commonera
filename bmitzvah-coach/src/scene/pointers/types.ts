import type { Euler, Group, Vector3 } from 'three/webgpu';

export type PointerId =
  | 'touchCursor'
  | 'mouseArrow'
  | 'blockCursor'
  | 'ballpoint'
  | 'woodPointer'
  | 'quill'
  | 'silverYad';

/**
 * The era-specific look of the pointer. The Yad class owns the feel —
 * spring follow, velocity lean, tip anchoring — a visual only describes
 * what is drawn and how it sits against the surface.
 */
export interface PointerVisual {
  /** Device meshes only (the contact-shadow sprite lives in Yad). */
  group: Group;
  /** Point that anchors to the smoothed target, in group-local space. */
  tipLocal: Vector3;
  /** Rest pose; lean offsets are applied around it. */
  restRotation: Euler;
  /** Lift off the surface along its normal. */
  hoverHeight: number;
  /** Velocity-lean gains, or false to glide flat (screen cursors). */
  lean: { gainX: number; gainZ: number } | false;
  /** Show the fake contact shadow. */
  shadow: boolean;
  /** Per-frame hook for blink/beam effects. */
  update?(ctx: { t: number; dt: number }): void;
}

export type PointerBuilder = () => PointerVisual;
