import type { Texture, Vector3 } from 'three/webgpu';
import type { AudioEngine } from './audio/engine';
import type { SceneContext } from './scene/renderer';
import type { Machine, AppState } from './state/machine';
import type { Progress } from './state/progress';
import type { Screens } from './ui/screens';
import type { LearnerStrip } from './ui/strip';

/** Test/dev hooks behind window.__shema — sessions overwrite the content-shaped ones. */
export interface DevHooks {
  wordScreenPos: (id: string) => { x: number; y: number } | null;
  wordIds: () => string[];
  state: () => AppState;
  touched: () => string[];
  camSettled: () => boolean;
  gotoLevel?: (n: number) => void;
}

/**
 * Everything built once per page life, shared by every session type
 * (the full scroll arc and the mini levels).
 */
export interface AppShared {
  params: URLSearchParams;
  canvas: HTMLCanvasElement;
  ctx: SceneContext;
  engine: AudioEngine;
  trackLoads: Map<'p1' | 'p2' | 'p3', Promise<void>>;
  textures: { albedo: Texture; normal: Texture; rough: Texture };
  ui: HTMLDivElement;
  strip: LearnerStrip;
  screens: Screens;
  machine: Machine;
  progress: Progress;
  persist: () => void;
  camTarget: Vector3;
  /** Camera distance that fits a w×h surface (portrait phones are width-bound). */
  fitDist: (w: number, h: number) => number;
  /** Per-session render-loop work; the shared loop owns camera lerp + strip reproject. */
  frameHooks: Set<(t: number, dt: number) => void>;
  dev: DevHooks;
  /** Bake ladder: smaller canvases on coarse-pointer/small/low-memory devices. */
  bakeSize: number;
}
