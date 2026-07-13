import { Group, HemisphereLight, PointLight } from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createParchmentMaterial } from '../parchmentMaterial';
import { createScrollColumn, surfacePoint, type ScrollColumnOptions } from '../scroll';
import type { EraDef, EraId } from './types';

/**
 * Placeholder era: a flat parchment card under the familiar candle rig.
 * Every mini level is playable on it before its real device era lands —
 * and it documents the exact EraScene contract those eras must honor.
 */
export function makeDefaultEra(id: EraId): EraDef {
  return {
    id,
    pointer: 'silverYad',
    theme: { tokens: {}, vignette: true },
    bake: { aspect: 1 },
    create({ inkTexture, pbr }) {
      const group = new Group();
      const opts: ScrollColumnOptions = { width: 1.3, height: 1.3, curlAmp: 0, noiseAmp: 0 };
      const parchment = createParchmentMaterial(inkTexture, pbr);
      const mesh = createScrollColumn(parchment.material, opts);
      group.add(mesh);

      const candle = new PointLight('#ffb066', 7, 0, 2);
      candle.position.set(-0.55, 0.65, 1.25);
      const fill = new HemisphereLight('#8899bb', '#221408', 0.4);
      group.add(candle, fill);
      const env = makeEnvTexture();
      const base = candle.intensity;

      return {
        id,
        group,
        surface: {
          mesh,
          surfacePoint: (u, v) => surfacePoint(u, v, opts),
          surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
          handles: {
            highlight: parchment.highlight,
            trail: parchment.trail,
            aux: parchment.aux,
          },
        },
        environment: { texture: env, intensity: 0.3 },
        lighting: {
          update(t) {
            candle.intensity = base * (1 + 0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1));
          },
        },
        fitSize: { width: 1.5, height: 1.42 },
        dispose() {
          mesh.geometry.dispose();
          parchment.material.dispose();
          env.dispose();
        },
      };
    },
  };
}
