import {
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  TorusGeometry,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createScreenMaterial } from '../screenMaterial';
import { deviceMaterial, roundedBox } from './deviceKit';
import type { EraDef, EraScene } from './types';

const SCREEN_W = 1.38;
const SCREEN_H = 0.92;
const SCREEN_Z = 0.033;

/** A 2026 tablet: brushed-aluminum slab, glass face, warm reading-app screen. */
export const eraTablet: EraDef = {
  id: 'tablet2026',
  pointer: 'touchCursor',
  theme: {
    // The one LIGHT theme on the timeline — modern daylight reading.
    tokens: {
      accent: '#2d6cdf',
      accentText: '#f4f7fd',
      paper: '#22232a',
      heading: '#16171c',
      bg: '#e9e4dc',
      card: 'rgba(255, 255, 255, 0.94)',
      cardBorder: 'rgba(45, 108, 223, 0.3)',
      muted: '#4a4d57',
      dim: '#7b7f8a',
      scrim: 'rgba(233, 228, 220, 0.62)',
    },
    vignette: false,
  },
  bake: { aspect: SCREEN_W / SCREEN_H, background: null, inkColor: '#ffffff' },
  create({ inkTexture }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);

    // Brushed-aluminum unibody with rounded corners.
    const alu = track(
      deviceMaterial({ tex: 'metal', color: '#9ba1ab', metalness: 0.85, normalScale: 0.7 }),
    );
    const body = new Mesh(track(roundedBox(1.52, 1.06, 0.05, 0.03)), alu);

    // Glass face: glossy near-black slab the screen sits inside — its margin
    // around the lit area reads as the bezel.
    const glass = new Mesh(
      track(roundedBox(1.47, 1.01, 0.012, 0.022)),
      track(new MeshStandardNodeMaterial({ color: '#08090b', roughness: 0.14, metalness: 0.25 })),
    );
    glass.position.z = 0.026;

    const screenMat = createScreenMaterial(inkTexture, {
      mode: 'darkOnLight',
      bgColor: [0.968, 0.953, 0.918], // warm reading-app paper
      textColor: [0.11, 0.11, 0.13],
    });
    track(screenMat.material);
    const screen = new Mesh(track(new PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat.material);
    screen.position.z = SCREEN_Z;

    const camDot = new Mesh(
      track(new CircleGeometry(0.007, 16)),
      track(new MeshBasicNodeMaterial({ color: '#10131c' })),
    );
    camDot.position.set(0, 0.5, SCREEN_Z);
    const camRing = new Mesh(track(new TorusGeometry(0.0095, 0.002, 8, 24)), alu);
    camRing.position.set(0, 0.5, SCREEN_Z);
    const homeBar = new Mesh(
      track(new PlaneGeometry(0.18, 0.011)),
      track(new MeshBasicNodeMaterial({ color: '#8a8d93' })),
    );
    homeBar.position.set(0, -0.5, SCREEN_Z);

    // Power + volume buttons along the top edge.
    const buttonMat = track(
      deviceMaterial({ tex: 'metal', color: '#787e88', metalness: 0.85, normalScale: 0.5 }),
    );
    for (const [x, w] of [
      [0.52, 0.1],
      [0.32, 0.16],
    ]) {
      const button = new Mesh(track(roundedBox(w, 0.016, 0.024, 0.007)), buttonMat);
      button.position.set(x, 0.534, 0);
      group.add(button);
    }

    group.add(body, glass, screen, camDot, camRing, homeBar);

    // Bright, even daylight — plus a daylight room for the aluminum to mirror.
    const hemi = new HemisphereLight('#ffffff', '#c8c2b8', 1.1);
    const key = new DirectionalLight('#f2ede4', 0.5);
    key.position.set(0.4, 1, 1.5);
    group.add(hemi, key, key.target);
    const env = track(
      makeEnvTexture({
        sky: '#cdd6e0',
        floor: '#8f8578',
        glowColor: '255, 250, 240',
        glowPos: [40, 10],
        glowRadius: 40,
        glowAlpha: 0.95,
      }),
    );

    const scene: EraScene = {
      id: 'tablet2026',
      group,
      surface: {
        mesh: screen,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * SCREEN_W,
          y: (v - 0.5) * SCREEN_H,
          z: SCREEN_Z,
        }),
        surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
        handles: {
          highlight: screenMat.highlight,
          trail: screenMat.trail,
          aux: screenMat.aux,
        },
      },
      environment: { texture: env, intensity: 0.9 },
      lighting: { update() {} },
      fitSize: { width: 1.66, height: 1.2 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
