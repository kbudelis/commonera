import {
  BoxGeometry,
  CircleGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  PointLight,
  Vector2,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createParchmentMaterial } from '../parchmentMaterial';
import { noise2 } from '../scroll';
import { deviceMaterial } from './deviceKit';
import type { EraDef, EraScene } from './types';

const VELLUM_W = 1.2;
const VELLUM_H = 1.45;
/** Wavier than the Torah scroll — a loose sheet of vellum, not a rolled one. */
const waveZ = (u: number, v: number) =>
  0.013 * VELLUM_W * (noise2(u * 5, v * 4) * 0.7 + noise2(u * 11, v * 9) * 0.3 - 0.5);

/** ~1200: a scribe's vellum leaf — iron-gall ink, sirtut ruling, candlelight. */
export const eraManuscript: EraDef = {
  id: 'manuscript1200',
  pointer: 'quill',
  theme: {
    tokens: {
      accent: '#b8862a',
      bg: '#191009',
      paper: '#e8d8b0',
    },
    vignette: true,
  },
  bake: { aspect: VELLUM_W / VELLUM_H, inkColor: '#3a2410' },
  create({ inkTexture, pbr }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);

    const parchment = createParchmentMaterial(inkTexture, pbr, {
      ageTintCenter: [1.0, 0.86, 0.62],
      ageTintEdge: [0.92, 0.78, 0.55],
      blotch: 0.16,
      edgeVignette: 0.6,
      ruledLines: { count: 15, strength: 0.05 },
    });
    track(parchment.material);
    const vellumGeo = track(new PlaneGeometry(VELLUM_W, VELLUM_H, 48, 48));
    const pos = vellumGeo.attributes.position;
    const uvAttr = vellumGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, waveZ(uvAttr.getX(i), uvAttr.getY(i)));
    pos.needsUpdate = true;
    vellumGeo.computeVertexNormals();
    const vellum = new Mesh(vellumGeo, parchment.material);

    // The scribe's table: dark wood, stone paperweights, an ink pot.
    const table = new Mesh(
      track(new BoxGeometry(3.2, 0.04, 2.2)),
      track(deviceMaterial({ tex: 'wood', color: '#6a5138', repeat: 2 })),
    );
    table.position.set(0, 0, -0.06);
    table.rotation.x = Math.PI / 2; // the sheet lies "against" the viewer plane
    // River stones: jittered icosahedra, flattened against the sheet.
    const stone = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#68635a', normalScale: 0.5 }),
    );
    for (const side of [-1, 1]) {
      const geo = track(new IcosahedronGeometry(0.085, 3));
      const sp = geo.attributes.position;
      for (let i = 0; i < sp.count; i++) {
        const x = sp.getX(i);
        const y = sp.getY(i);
        const z = sp.getZ(i);
        const bump = 1 + 0.17 * (noise2(x * 14 + side * 9, y * 14 - z * 6) - 0.5);
        sp.setXYZ(i, x * bump, y * bump, z * bump * 0.55);
      }
      sp.needsUpdate = true;
      geo.computeVertexNormals();
      const weight = new Mesh(geo, stone);
      weight.rotation.z = side * 0.7; // two different faces up
      weight.position.set(side * 0.655, 0.755, 0.026);
      group.add(weight);
    }
    // Glazed ceramic ink pot: belly, neck, flared lip — and the ink inside.
    const potProfile = [
      [0, 0], [0.05, 0.002], [0.063, 0.014], [0.068, 0.034], [0.058, 0.054],
      [0.041, 0.062], [0.037, 0.074], [0.046, 0.08], [0.05, 0.084], [0.042, 0.085],
    ].map(([r, y]) => new Vector2(r, y));
    const pot = new Mesh(
      track(new LatheGeometry(potProfile, 24)),
      track(new MeshStandardNodeMaterial({ color: '#2a2018', roughness: 0.28, metalness: 0.05 })),
    );
    pot.rotation.x = Math.PI / 2;
    pot.position.set(0.78, -0.55, -0.04);
    const inkPool = new Mesh(
      track(new CircleGeometry(0.036, 20)),
      track(new MeshBasicNodeMaterial({ color: '#0c0805' })),
    );
    inkPool.position.set(0.78, -0.55, 0.036);
    group.add(vellum, table, pot, inkPool);

    // The candle rig this era was born for.
    const candle = new PointLight('#ffb066', 7, 0, 2);
    candle.position.set(-0.55, 0.65, 1.25);
    const fill = new HemisphereLight('#8899bb', '#221408', 0.4);
    group.add(candle, fill);
    const env = track(makeEnvTexture());
    const base = candle.intensity;

    const scene: EraScene = {
      id: 'manuscript1200',
      group,
      surface: {
        mesh: vellum,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * VELLUM_W,
          y: (v - 0.5) * VELLUM_H,
          z: waveZ(u, v),
        }),
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
      fitSize: { width: 1.6, height: 1.66 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
