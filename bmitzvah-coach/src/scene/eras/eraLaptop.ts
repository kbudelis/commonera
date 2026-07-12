import {
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardNodeMaterial,
  PlaneGeometry,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createScreenMaterial } from '../screenMaterial';
import { deviceMaterial, keyboardTexture, roundedBox } from './deviceKit';
import type { EraDef, EraScene } from './types';

const SCREEN_W = 1.42;
const SCREEN_H = 0.92;
const SCREEN_Y = 0.12;
const SCREEN_Z = 0.032;

/** A 1995 clamshell: beige shell + passive-matrix LCD + keyboard slab. */
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

    // Beige injection-molded plastic — fine grain from the normal map,
    // rounded shells instead of sharp slabs.
    const beige = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#c9bfa9', repeat: 2, normalScale: 0.8 }),
    );
    const darkPlastic = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#46423a', repeat: 2, normalScale: 0.6 }),
    );

    // Lid (screen half): shell, inset bezel slab, self-lit LCD.
    const lid = new Mesh(track(roundedBox(1.72, 1.2, 0.06, 0.035)), beige);
    lid.position.set(0, SCREEN_Y, -0.01);
    const bezel = new Mesh(track(roundedBox(1.58, 1.06, 0.014, 0.025)), darkPlastic);
    bezel.position.set(0, SCREEN_Y, 0.022);
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
    const base = new Mesh(track(roundedBox(1.72, 0.055, 0.78, 0.028)), beige);
    base.position.set(0, -0.56, 0.32);
    base.rotation.x = 0.42; // pitched up so the keys read from the front
    const kbTex = track(keyboardTexture());
    const keys = new Mesh(
      track(new PlaneGeometry(1.5, 0.45)),
      track(new MeshStandardNodeMaterial({ map: kbTex, roughness: 0.85 })),
    );
    // Parented to the base in ITS local space so they ride the pitch exactly.
    keys.position.set(0, 0.0295, -0.1);
    keys.rotation.x = -Math.PI / 2;
    base.add(keys);
    const trackpad = new Mesh(track(roundedBox(0.3, 0.008, 0.15, 0.004)), darkPlastic);
    trackpad.position.set(0, 0.0295, 0.24);
    base.add(trackpad);

    // Hinge barrels where the lid meets the base.
    const hingeGeo = track(new CylinderGeometry(0.034, 0.034, 0.24, 16));
    for (const side of [-1, 1]) {
      const hinge = new Mesh(hingeGeo, darkPlastic);
      hinge.rotation.z = Math.PI / 2;
      hinge.position.set(side * 0.55, -0.455, 0.02);
      group.add(hinge);
    }

    group.add(lid, bezel, screen, base);

    // Office fluorescents: even, slightly cool. The LCD is self-lit anyway.
    const hemi = new HemisphereLight('#dfe6ee', '#55504a', 0.9);
    const key = new DirectionalLight('#cfd8e8', 0.5);
    key.position.set(0.6, 1.2, 1.4);
    group.add(hemi, key, key.target);
    const env = track(
      makeEnvTexture({
        sky: '#aeb8c6',
        floor: '#4a453e',
        glowColor: '225, 235, 250',
        glowPos: [64, 8],
        glowRadius: 52,
        glowAlpha: 0.85,
      }),
    );

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
      environment: { texture: env, intensity: 0.45 },
      lighting: { update() {} },
      fitSize: { width: 1.95, height: 1.85 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
