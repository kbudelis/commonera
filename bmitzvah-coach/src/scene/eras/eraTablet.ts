import {
  BoxGeometry,
  CircleGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
} from 'three/webgpu';
import { createScreenMaterial } from '../screenMaterial';
import type { EraDef, EraScene } from './types';

const SCREEN_W = 1.38;
const SCREEN_H = 0.92;
const SCREEN_Z = 0.019;

/** A 2026 tablet: dark glass slab, warm reading-app screen, daylight. */
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

    const body = new Mesh(
      track(new BoxGeometry(1.52, 1.06, 0.035)),
      track(new MeshStandardNodeMaterial({ color: '#2b2e33', metalness: 0.7, roughness: 0.35 })),
    );

    const screenMat = createScreenMaterial(inkTexture, {
      mode: 'darkOnLight',
      bgColor: [0.968, 0.953, 0.918], // warm reading-app paper
      textColor: [0.11, 0.11, 0.13],
    });
    track(screenMat.material);
    const screen = new Mesh(track(new PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat.material);
    screen.position.z = SCREEN_Z;

    const camDot = new Mesh(
      track(new CircleGeometry(0.008, 16)),
      track(new MeshBasicNodeMaterial({ color: '#14161a' })),
    );
    camDot.position.set(0, 0.5, SCREEN_Z);
    const homeBar = new Mesh(
      track(new PlaneGeometry(0.18, 0.011)),
      track(new MeshBasicNodeMaterial({ color: '#8a8d93' })),
    );
    homeBar.position.set(0, -0.5, SCREEN_Z);

    group.add(body, screen, camDot, homeBar);

    // Bright, even daylight — screens don't need drama.
    const hemi = new HemisphereLight('#ffffff', '#c8c2b8', 1.1);
    const key = new DirectionalLight('#f2ede4', 0.5);
    key.position.set(0.4, 1, 1.5);
    group.add(hemi, key, key.target);

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
      environment: { texture: null, intensity: 1 },
      lighting: { update() {} },
      fitSize: { width: 1.66, height: 1.2 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
