import type { CanvasTexture, Group, Mesh, Texture } from 'three/webgpu';
import type { HighlightHandles } from '../highlightRig';
import type { PointerId } from '../pointers/types';
import type { EraTheme } from '../../ui/theme';
import type { BakeOptions } from '../../text/bake';

export type EraId =
  | 'tablet2026'
  | 'laptop1995'
  | 'typewriter1958'
  | 'siddur1565'
  | 'manuscript1200'
  | 'scroll100bce';

/** The medium that carries the baked text — parchment, page, or screen. */
export interface TextSurface {
  /** Raycast target with REAL CPU vertices (raycasting can't see shader displacement). */
  mesh: Mesh;
  /** World-space point on the surface for a uv — anchors yad, strip, labels. */
  surfacePoint(u: number, v: number): { x: number; y: number; z: number };
  /** Outward normal at uv, for the yad's hover offset on tilted screens. */
  surfaceNormal(u: number, v: number): { x: number; y: number; z: number };
  /** The three glow handles (same contract as the parchment material). */
  handles: HighlightHandles;
}

/** A built era: the device (with its lights parented inside) around the text. */
export interface EraScene {
  id: EraId;
  group: Group;
  surface: TextSurface;
  /** Set on scene.environment while this era is live (null = none). */
  environment: { texture: Texture | null; intensity: number };
  lighting: { update(t: number): void };
  /** Device animation — CRT flicker, blinking LEDs. */
  update?(t: number, dt: number): void;
  /** Extent the camera should frame, scene units (device, not just text). */
  fitSize: { width: number; height: number };
  /** Free era-created geometries/materials/textures (NOT the ink texture — the session owns it). */
  dispose(): void;
}

export interface EraDeps {
  inkTexture: CanvasTexture;
  /** Session-owned mask that fills in as words are first touched — materials
      tint visited ink with it so learners can spot what they've missed. */
  visited: CanvasTexture;
  /** Shared parchment PBR maps — never dispose these. */
  pbr: { albedo: Texture; normal: Texture; rough: Texture };
  quality: { bakeSize: number };
}

export interface EraDef {
  id: EraId;
  pointer: PointerId;
  theme: EraTheme;
  /** Bake defaults the session merges into its bakeColumn call. aspect = canvas w/h. */
  bake: Partial<BakeOptions> & { aspect: number };
  create(deps: EraDeps): EraScene;
}
