import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  HemisphereLight,
  PointLight,
  SRGBColorSpace,
  type Scene,
} from 'three/webgpu';

export interface LightingRig {
  /** Call each frame with seconds for the candle flicker. */
  update(t: number): void;
  /** Remove the rig's lights and environment — era swaps need a clean scene. */
  dispose(): void;
}

/** Era knobs — every default reproduces the candlelit scroll rig exactly. */
export interface LightingOptions {
  candleColor?: string;
  candleIntensity?: number;
  fillSky?: string;
  fillGround?: string;
  fillIntensity?: number;
  envIntensity?: number;
  /** Flicker amplitude multiplier (0 = steady). */
  flicker?: number;
}

/** Small hand-painted equirect environment: warm glow above-left, dark room below. */
export function makeEnvTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#171009';
  g.fillRect(0, 0, 128, 64);
  // dim warm ceiling glow
  const glow = g.createRadialGradient(40, 14, 2, 40, 14, 46);
  glow.addColorStop(0, 'rgba(255, 176, 102, 0.9)');
  glow.addColorStop(1, 'rgba(255, 176, 102, 0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 128, 64);
  const t = new CanvasTexture(c);
  t.mapping = EquirectangularReflectionMapping;
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function createLighting(scene: Scene, opts: LightingOptions = {}): LightingRig {
  const {
    candleColor = '#ffb066',
    candleIntensity = 7,
    fillSky = '#8899bb',
    fillGround = '#221408',
    fillIntensity = 0.4,
    envIntensity = 0.3,
    flicker = 1,
  } = opts;

  // Reading-candle key light: warm, above-left, slightly frontal.
  const candle = new PointLight(candleColor, candleIntensity, 0, 2);
  candle.position.set(-0.55, 0.65, 1.25);
  scene.add(candle);

  // Cool moonlight fill so shadows aren't dead black.
  const fill = new HemisphereLight(fillSky, fillGround, fillIntensity);
  scene.add(fill);

  // Environment for the yad's metal + subtle parchment sheen.
  const env = makeEnvTexture();
  scene.environment = env;
  scene.environmentIntensity = envIntensity;

  const base = candle.intensity;
  return {
    update(t: number) {
      candle.intensity =
        base * (1 + flicker * (0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1)));
    },
    dispose() {
      scene.remove(candle, fill);
      if (scene.environment === env) {
        scene.environment = null;
        scene.environmentIntensity = 1;
      }
      env.dispose();
    },
  };
}
