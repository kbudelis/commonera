import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
} from 'three/webgpu';
import { makeEnvTexture } from '../lighting';
import { createPaperMaterial } from '../paperMaterial';
import { deviceMaterial, roundedBox } from './deviceKit';
import type { EraDef, EraScene } from './types';

const PAPER_W = 1.15;
const PAPER_H = 1.45;
const INK = '#2c3138';

/** Paper curls back over the platen as it feeds out at the top. */
function curlZ(v: number) {
  const t = Math.min(1, Math.max(0, (v - 0.82) / 0.18));
  const s = t * t * (3 - 2 * t);
  return -0.13 * s * s;
}

/** Re-rasterize the baked text into printer dots (one pass, bake-time). */
function dotMatrixPass(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const w = canvas.width;
  const h = canvas.height;
  const cell = Math.max(5, Math.round(w / 230));
  const img = ctx.getImageData(0, 0, w, h);
  const a = img.data;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = INK;
  for (let cy = 0; cy < h; cy += cell) {
    for (let cx = 0; cx < w; cx += cell) {
      let sum = 0;
      let n = 0;
      for (let y = cy; y < Math.min(cy + cell, h); y += 2) {
        for (let x = cx; x < Math.min(cx + cell, w); x += 2) {
          sum += a[(y * w + x) * 4 + 3];
          n++;
        }
      }
      if (sum / n > 46) {
        ctx.beginPath();
        ctx.arc(cx + cell / 2, cy + cell / 2, cell * 0.46, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** Tractor-feed edge strip: perforation dashes + sprocket holes. */
function sprocketTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.fillStyle = '#eeeadf';
  g.fillRect(0, 0, 64, 1024);
  g.strokeStyle = 'rgba(90, 84, 72, 0.45)';
  g.setLineDash([7, 5]);
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(6, 0);
  g.lineTo(6, 1024);
  g.stroke();
  g.fillStyle = '#4a4640';
  for (let y = 24; y < 1024; y += 56) {
    g.beginPath();
    g.arc(38, y, 9, 0, Math.PI * 2);
    g.fill();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Displace a plane's vertices with the shared paper curl. */
function curlPlane(geo: PlaneGeometry) {
  const pos = geo.attributes.position;
  const uvAttr = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, curlZ(uvAttr.getY(i)));
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

/** 1978: green-bar tractor paper feeding out of a charcoal dot-matrix printer. */
export const eraDotMatrix: EraDef = {
  id: 'dotmatrix1978',
  pointer: 'ballpoint',
  theme: {
    tokens: {
      accent: '#d9c06a',
      bg: '#2a2430',
      paper: '#efe9da',
    },
    vignette: true,
  },
  bake: { aspect: PAPER_W / PAPER_H, inkColor: INK, postProcess: dotMatrixPass },
  create({ inkTexture, pbr }) {
    const group = new Group();
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(d: T): T => (disposables.push(d), d);

    const paperMat = createPaperMaterial(inkTexture, { normal: pbr.normal, normalScale: 0.3 });
    track(paperMat.material);
    const paperGeo = track(new PlaneGeometry(PAPER_W, PAPER_H, 24, 48));
    curlPlane(paperGeo);
    const paper = new Mesh(paperGeo, paperMat.material);

    const stripTex = track(sprocketTexture());
    const stripMat = track(new MeshStandardNodeMaterial({ map: stripTex, roughness: 0.9 }));
    for (const side of [-1, 1]) {
      const geo = track(new PlaneGeometry(0.1, PAPER_H, 2, 48));
      curlPlane(geo);
      const strip = new Mesh(geo, stripMat);
      strip.position.x = side * (PAPER_W / 2 + 0.05);
      strip.scale.x = side; // mirror the perforation dash inward
      group.add(strip);
    }

    // The printer the paper feeds from: molded charcoal plastic.
    const charcoal = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#45424a', repeat: 2, normalScale: 0.8 }),
    );
    const darkTrim = track(
      deviceMaterial({ tex: 'plastic', albedo: false, color: '#232125', repeat: 2, normalScale: 0.6 }),
    );
    const printer = new Mesh(track(roundedBox(1.62, 0.3, 0.5, 0.05)), charcoal);
    printer.position.set(0, 0.9, -0.24);
    // Control panel with its status lights, bottom-right of the fascia.
    const panel = new Mesh(track(roundedBox(0.34, 0.1, 0.024, 0.01)), darkTrim);
    panel.position.set(0.52, 0.85, 0.012);
    for (const [x, color] of [
      [0.44, '#57e07a'],
      [0.52, '#e0b357'],
    ] as const) {
      const led = new Mesh(
        track(new CylinderGeometry(0.011, 0.011, 0.012, 12)),
        track(new MeshBasicNodeMaterial({ color })),
      );
      led.rotation.x = Math.PI / 2;
      led.position.set(x, 0.85, 0.028);
      group.add(led);
    }
    const platen = new Mesh(
      track(new CylinderGeometry(0.055, 0.055, 1.5, 24)),
      track(new MeshStandardNodeMaterial({ color: '#232125', roughness: 0.45 })),
    );
    platen.rotation.z = Math.PI / 2;
    platen.position.set(0, 0.74, -0.13);
    for (const side of [-1, 1]) {
      const cap = new Mesh(track(new CylinderGeometry(0.075, 0.075, 0.045, 20)), darkTrim);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(side * 0.77, 0.74, -0.13);
      group.add(cap);
    }
    // A desk to ground the hanging paper.
    const desk = new Mesh(
      track(new BoxGeometry(3.2, 0.04, 1.8)),
      track(deviceMaterial({ tex: 'wood', color: '#8a6f52', repeat: 2 })),
    );
    desk.position.set(0, -0.79, -0.35);
    group.add(paper, printer, panel, platen, desk);

    // Desk-lamp warmth over a dim office.
    const lamp = new PointLight('#ffe6c0', 3, 0, 2);
    lamp.position.set(0.4, 0.8, 1.4);
    const fill = new HemisphereLight('#c8c8d0', '#2a2430', 0.5);
    group.add(lamp, fill);
    const env = track(
      makeEnvTexture({
        sky: '#2a2430',
        floor: '#141017',
        glowColor: '255, 214, 170',
        glowPos: [30, 12],
        glowRadius: 44,
        glowAlpha: 0.7,
      }),
    );

    const scene: EraScene = {
      id: 'dotmatrix1978',
      group,
      surface: {
        mesh: paper,
        surfacePoint: (u, v) => ({
          x: (u - 0.5) * PAPER_W,
          y: (v - 0.5) * PAPER_H,
          z: curlZ(v),
        }),
        surfaceNormal: () => ({ x: 0, y: 0, z: 1 }),
        handles: {
          highlight: paperMat.highlight,
          trail: paperMat.trail,
          aux: paperMat.aux,
        },
      },
      environment: { texture: env, intensity: 0.4 },
      lighting: { update() {} },
      fitSize: { width: 1.7, height: 2.0 },
      dispose() {
        for (const d of disposables) d.dispose();
      },
    };
    return scene;
  },
};
