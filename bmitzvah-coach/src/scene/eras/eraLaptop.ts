import {
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three/webgpu';
import { createScreenMaterial } from '../screenMaterial';
import type { EraDef, EraScene } from './types';

const SCREEN_W = 1.42;
const SCREEN_H = 0.92;
const SCREEN_Y = 0.12;
const SCREEN_Z = 0.03;

/** Rounded-rect key grid drawn in 2D — one texture instead of seventy meshes. */
function keyboardTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 384;
  const g = c.getContext('2d')!;
  g.fillStyle = '#a8a294';
  g.fillRect(0, 0, c.width, c.height);
  const rows = 5;
  const pad = 10;
  const keyH = (c.height - pad * 2) / rows - 8;
  for (let r = 0; r < rows; r++) {
    const y = pad + r * (keyH + 8);
    const keys = r === rows - 1 ? 8 : 14 + (r % 2);
    const keyW = (c.width - pad * 2) / keys - 7;
    for (let k = 0; k < keys; k++) {
      const x = pad + k * (keyW + 7);
      const w = r === rows - 1 && k === 3 ? keyW * 3.2 : keyW; // space bar
      g.fillStyle = '#8d887b';
      g.beginPath();
      g.roundRect(x + 2, y + 3, w, keyH, 5);
      g.fill();
      g.fillStyle = '#c2bcae';
      g.beginPath();
      g.roundRect(x, y, w, keyH, 5);
      g.fill();
      if (r === rows - 1 && k === 3) k += 2;
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** A 1995 clamshell: beige lid + passive-matrix LCD + keyboard slab. */
export const eraLaptop: EraDef = {
  id: 'laptop1995',
  pointer: 'mouseArrow',
  theme: {
    tokens: {
      accent: '#7f9bc4',
      accentText: '#141a26',
      paper: '#e8eaf0',
      heading: '#f2f4f8',
      bg: '#3a3f4a',
      card: 'rgba(40, 44, 54, 0.95)',
      cardBorder: 'rgba(127, 155, 196, 0.4)',
      muted: '#b9c2d2',
      dim: '#828b9c',
      scrim: 'rgba(20, 23, 30, 0.72)',
    },
    vignette: false,
  },
  bake: { aspect: SCREEN_W / SCREEN_H, background: null, inkColor: '#ffffff' },
  create({ inkTexture }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);
    const solid = (color: string, rough = 0.75) =>
      track(new MeshStandardNodeMaterial({ color, roughness: rough, metalness: 0.05 }));

    // Lid (screen half): beige shell, dark bezel, self-lit LCD.
    const beige = solid('#b6b0a2');
    const lid = new Mesh(track(new BoxGeometry(1.72, 1.2, 0.055)), beige);
    lid.position.set(0, SCREEN_Y, -0.01);
    const bezel = new Mesh(track(new PlaneGeometry(1.58, 1.06)), solid('#46423a', 0.6));
    bezel.position.set(0, SCREEN_Y, 0.021);
    const screenMat = createScreenMaterial(inkTexture, {
      mode: 'darkOnLight',
      bgColor: [0.77, 0.8, 0.75], // gray-green passive matrix
      textColor: [0.13, 0.16, 0.24],
      bgGradient: 0.12,
    });
    track(screenMat.material);
    const screen = new Mesh(track(new PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat.material);
    screen.position.set(0, SCREEN_Y, SCREEN_Z);

    // Base (keyboard half), pitched gently toward the viewer.
    const base = new Mesh(track(new BoxGeometry(1.72, 0.05, 0.78)), beige);
    base.position.set(0, -0.56, 0.32);
    base.rotation.x = 0.42; // pitched up so the keys read from the front
    const kbTex = track(keyboardTexture());
    const keys = new Mesh(
      track(new PlaneGeometry(1.5, 0.45)),
      track(new MeshStandardNodeMaterial({ map: kbTex, roughness: 0.85 })),
    );
    // Parented to the base in ITS local space so they ride the pitch exactly.
    keys.position.set(0, 0.027, -0.1);
    keys.rotation.x = -Math.PI / 2;
    base.add(keys);
    const trackpad = new Mesh(track(new PlaneGeometry(0.3, 0.15)), solid('#8d887b', 0.5));
    trackpad.position.set(0, 0.027, 0.24);
    trackpad.rotation.x = -Math.PI / 2;
    base.add(trackpad);

    group.add(lid, bezel, screen, base);

    // Office fluorescents: even, slightly cool. The LCD is self-lit anyway.
    const hemi = new HemisphereLight('#dfe6ee', '#55504a', 0.9);
    const key = new DirectionalLight('#cfd8e8', 0.5);
    key.position.set(0.6, 1.2, 1.4);
    group.add(hemi, key, key.target);

    const scene: EraScene = {
      id: 'laptop1995',
      group,
      surface: {
        mesh: screen,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * SCREEN_W,
          y: (v - 0.5) * SCREEN_H + SCREEN_Y,
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
      fitSize: { width: 1.95, height: 1.85 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
