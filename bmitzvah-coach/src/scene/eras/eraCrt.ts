import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  PointLight,
  SphereGeometry,
} from 'three/webgpu';
import { createScreenMaterial } from '../screenMaterial';
import type { EraDef, EraScene } from './types';

const SCREEN_W = 1.3;
const SCREEN_H = 1.0;
/** The glass bulges toward the viewer, strongest at the center. */
const bulgeZ = (u: number, v: number) =>
  0.05 * (1 - (2 * u - 1) ** 2) * (1 - (2 * v - 1) ** 2);

/** 1984: a beige terminal in a dark room, lit by its own green phosphor. */
export const eraCrt: EraDef = {
  id: 'crt1984',
  pointer: 'blockCursor',
  theme: {
    tokens: {
      accent: '#39ff6a',
      accentText: '#04180a',
      paper: '#bfe8c8',
      heading: '#d9f5df',
      bg: '#0a0d0a',
      card: 'rgba(6, 16, 8, 0.95)',
      cardBorder: 'rgba(57, 255, 106, 0.35)',
      muted: '#8fc49d',
      dim: '#588a66',
      scrim: 'rgba(3, 8, 4, 0.78)',
    },
    vignette: true,
  },
  bake: { aspect: SCREEN_W / SCREEN_H, inkColor: '#ffffff', filter: 'nearest' },
  create({ inkTexture }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);
    const beige = track(new MeshStandardNodeMaterial({ color: '#d8caa8', roughness: 0.8 }));

    // Bulged glass with the text (CPU verts — raycast-true).
    const screenMat = createScreenMaterial(inkTexture, {
      mode: 'lightOnDark',
      bgColor: [0.03, 0.07, 0.04],
      textColor: [0.22, 1.0, 0.42],
      scanlines: { count: 220, strength: 0.18 },
      flicker: 0.02,
    });
    track(screenMat.material);
    const glassGeo = track(new PlaneGeometry(SCREEN_W, SCREEN_H, 48, 36));
    const pos = glassGeo.attributes.position;
    const uvAttr = glassGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, bulgeZ(uvAttr.getX(i), uvAttr.getY(i)));
    pos.needsUpdate = true;
    glassGeo.computeVertexNormals();
    const glass = new Mesh(glassGeo, screenMat.material);

    // Shell around the tube, vents, pedestal, keyboard, desk.
    const shell = new Mesh(track(new BoxGeometry(1.6, 1.3, 0.95)), beige);
    shell.position.z = -0.5;
    for (let i = 0; i < 3; i++) {
      const vent = new Mesh(track(new BoxGeometry(1.3, 0.012, 0.5)), track(
        new MeshStandardNodeMaterial({ color: '#b8ab8c', roughness: 0.9 }),
      ));
      vent.position.set(0, 0.66, -0.45 - i * 0.14);
      group.add(vent);
    }
    const neck = new Mesh(track(new CylinderGeometry(0.16, 0.2, 0.16, 18)), beige);
    neck.position.set(0, -0.73, -0.5);
    const foot = new Mesh(track(new BoxGeometry(0.9, 0.06, 0.7)), beige);
    foot.position.set(0, -0.83, -0.45);
    const keyboard = new Mesh(track(new BoxGeometry(1.25, 0.06, 0.42)), beige);
    keyboard.position.set(0, -0.83, 0.55);
    keyboard.rotation.x = 0.09;
    const led = new Mesh(
      track(new SphereGeometry(0.013, 10, 8)),
      track(new MeshBasicNodeMaterial({ color: '#ff4433' })),
    );
    led.position.set(0.68, -0.57, 0.01);
    const desk = new Mesh(
      track(new BoxGeometry(3.4, 0.04, 2.2)),
      track(new MeshStandardNodeMaterial({ color: '#503c28', roughness: 0.85 })),
    );
    desk.position.set(0, -0.88, -0.2);
    group.add(glass, shell, neck, foot, keyboard, led, desk);

    // The room is lit by the tube itself.
    const phosphor = new PointLight('#40cf70', 0.9, 0, 1.6);
    phosphor.position.set(0, 0, 0.7);
    const fill = new HemisphereLight('#2a3040', '#0a0a0c', 0.25);
    group.add(phosphor, fill);
    const base = phosphor.intensity;

    const scene: EraScene = {
      id: 'crt1984',
      group,
      surface: {
        mesh: glass,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * SCREEN_W,
          y: (v - 0.5) * SCREEN_H,
          z: bulgeZ(u, v),
        }),
        surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
        handles: {
          highlight: screenMat.highlight,
          trail: screenMat.trail,
          aux: screenMat.aux,
        },
      },
      environment: { texture: null, intensity: 1 },
      lighting: {
        update(t) {
          phosphor.intensity = base * (1 + 0.05 * Math.sin(t * 11.3));
        },
      },
      update(t) {
        led.visible = Math.sin(t * 2.4) > -0.85;
      },
      fitSize: { width: 1.85, height: 1.95 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
